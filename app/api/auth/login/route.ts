import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function OPTIONS() {
  return NextResponse.json({}, { 
    headers: {
      'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Email ve şifre kontrolü
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // E-posta doğrulaması kontrolü
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Lütfen önce e-posta adresinizi doğrulayın' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Hatalı şifre' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // JWT token oluştur
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
      id: user._id.toString(),
      email: user.email,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Response oluştur
    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

    // Token'ı cookie'ye kaydet
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 saat
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}