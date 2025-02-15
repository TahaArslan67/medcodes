import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

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
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Veritabanı bağlantısı
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Kullanıcıyı bul
    let user;
    try {
      // Email'i lowercase yaparak ara
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      console.log('User search result:', user ? 'User found' : 'User not found');
      
      if (!user) {
        console.log('No user found with email:', email);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      console.log('User details:', {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    } catch (error) {
      console.error('Error finding user:', error);
      return NextResponse.json(
        { error: 'Kullanıcı arama hatası.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifre kontrolü
    try {
      console.log('Attempting password comparison');
      console.log('Input password length:', password.length);
      console.log('Stored password length:', user.password.length);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isMatch);

      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return NextResponse.json(
        { error: 'Şifre doğrulama hatası.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // JWT token oluştur
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const token = await new SignJWT({ 
        id: user._id.toString(),
        email: user.email,
        name: user.name
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
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
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
      return NextResponse.json(
        { error: 'Token oluşturma hatası.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
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