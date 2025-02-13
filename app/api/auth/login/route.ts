import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    // Validasyon
    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
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

    // Veritabanı bağlantısı
    await connectDB();
    console.log('Database connected successfully');

    // Kullanıcıyı bul
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
      console.log('User search result:', user ? 'User found' : 'User not found');
      
      if (!user) {
        console.log('No user found with email:', email);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { status: 400 }
        );
      }

      console.log('User details:', {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password
      });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }

    // Şifre kontrolü
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isMatch);

      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
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

      // Token'ı cookie'ye kaydet
      const response = NextResponse.json(
        { 
          message: 'Giriş başarılı.',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          }
        },
        { status: 200 }
      );

      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 saat
      });

      console.log('Login successful for user:', email);
      return response;
    } catch (error) {
      console.error('Error creating JWT token:', error);
      throw error;
    }

  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 