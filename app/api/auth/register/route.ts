import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, recaptchaToken } = body;

    console.log('Register attempt:', { email, name });

    // Validasyon
    if (!name || !email || !password || !recaptchaToken) {
      console.log('Validation failed: Missing fields');
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    // reCAPTCHA doğrulama
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    });

    const recaptchaData = await recaptchaResponse.json();
    console.log('reCAPTCHA response:', recaptchaData);

    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: 'reCAPTCHA doğrulaması başarısız.' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { status: 400 }
      );
    }

    // Şifre kontrolü
    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Veritabanı bağlantısı
    await connectDB();
    console.log('Database connected');

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', existingUser ? 'User exists' : 'User does not exist');

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı.' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log('User created:', { userId: user._id });

    // JWT token oluştur
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const token = await new SignJWT({ 
      id: user._id.toString(),
      email: user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    console.log('JWT token created');

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

    console.log('Registration successful');
    return response;

  } catch (error) {
    console.error('Registration error details:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 