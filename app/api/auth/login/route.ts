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
    console.log('Login request received');
    const body = await request.json();
    console.log('Request body:', {
      email: body.email,
      passwordLength: body.password?.length,
      passwordFirstThree: body.password?.substring(0, 3)
    });
    const { email, password } = body;

    console.log('Login attempt for email:', email);

    // Validasyon
    if (!email || !password) {
      const missingFields = {
        email: !email,
        password: !password
      };
      console.log('Missing fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Tüm alanlar zorunludur.',
          details: missingFields
        },
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
      const normalizedEmail = email.toLowerCase().trim();
      console.log('Searching for user with email:', normalizedEmail);
      
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      console.log('User search result:', user ? {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        passwordFirstThree: user.password?.substring(0, 3)
      } : 'User not found');
      
      if (!user) {
        console.log('No user found with email:', normalizedEmail);
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

      console.log('Found user password:', user.password ? {
        length: user.password.length,
        firstThree: user.password.substring(0, 3)
      } : 'not exists');
      
      // Şifre kontrolü
      console.log('Attempting password comparison with:', {
        inputPasswordLength: password.length,
        inputPasswordFirstThree: password.substring(0, 3),
        storedPasswordLength: user.password?.length,
        storedPasswordFirstThree: user.password?.substring(0, 3)
      });

      const isMatch = await user.comparePassword(password);
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

      console.log('Login successful for user:', {
        id: user._id,
        email: user.email,
        name: user.name
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