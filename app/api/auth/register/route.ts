import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, recaptchaToken } = body;

    console.log('Register attempt:', { name, email });

    // Validasyon
    if (!name || !email || !password || !recaptchaToken) {
      console.log('Missing fields:', {
        name: !!name,
        email: !!email,
        password: !!password,
        recaptchaToken: !!recaptchaToken
      });
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    // reCAPTCHA doğrulama
    try {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      });

      const recaptchaData = await recaptchaResponse.json();
      console.log('reCAPTCHA verification result:', recaptchaData);

      if (!recaptchaData.success) {
        console.log('reCAPTCHA verification failed:', recaptchaData['error-codes']);
        return NextResponse.json(
          { error: 'reCAPTCHA doğrulaması başarısız.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      throw error;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { status: 400 }
      );
    }

    // Şifre kontrolü
    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Veritabanı bağlantısı
    await connectDB();
    console.log('Database connected successfully');

    // Email kontrolü
    try {
      const existingUser = await User.findOne({ email });
      console.log('Existing user check:', existingUser ? 'User exists' : 'User does not exist');

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }

    // Şifreyi hashle
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }

    // Yeni kullanıcı oluştur
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      console.log('User created successfully:', { userId: user._id });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    // JWT token oluştur
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const token = await new SignJWT({ 
        id: user._id.toString(),
        email: user.email 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);

      console.log('JWT token created successfully');

      // Token'ı cookie'ye kaydet ve response'u hazırla
      const response = NextResponse.json(
        { 
          message: 'Kayıt başarılı.',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          }
        },
        { status: 201 }
      );

      // Cookie'yi ayarla
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 saat
      });

      console.log('Registration successful for user:', email);
      return response;
    } catch (error) {
      console.error('Error creating JWT token:', error);
      throw error;
    }

  } catch (error) {
    console.error('Registration error details:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 