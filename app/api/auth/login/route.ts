import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email }); // Email'i logla

    // Validasyon
    if (!email || !password) {
      console.log('Validation failed: Missing fields');
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
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

    // Veritabanı bağlantısı
    await connectDB();
    console.log('Database connected');

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    console.log('User search result:', user ? 'User found' : 'User not found');

    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı.' },
        { status: 400 }
      );
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı.' },
        { status: 400 }
      );
    }

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

    console.log('Login successful');
    return response;

  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 