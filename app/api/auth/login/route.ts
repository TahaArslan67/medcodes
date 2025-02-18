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
    console.log('=== LOGIN İSTEĞİ BAŞLADI ===');
    console.log('Login request received');
    const body = await request.json();
    console.log('İstek detayları:', {
      email: body.email,
      passwordLength: body.password?.length,
      passwordFirstThree: body.password?.substring(0, 3),
      rawBody: JSON.stringify(body),
      headers: {
        contentType: request.headers.get('content-type'),
        origin: request.headers.get('origin'),
        cookie: request.headers.get('cookie')
      }
    });

    if (!body) {
      console.error('Request body boş geldi');
      return NextResponse.json(
        { error: 'Geçersiz istek formatı.' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    const { email, password } = body;

    console.log('=== VALİDASYON KONTROLLERI ===');
    console.log('Login girişimi:', {
      email,
      passwordExists: !!password,
      bodyKeys: Object.keys(body)
    });

    // Validasyon
    if (!email || !password) {
      const missingFields = {
        email: !email,
        password: !password,
        emailType: typeof email,
        passwordType: typeof password
      };
      console.log('Eksik alanlar tespit edildi:', missingFields);
      return NextResponse.json(
        { 
          error: 'Tüm alanlar zorunludur.',
          details: missingFields
        },
        { 
          status: 402,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log('Email format kontrolü:', {
      email,
      isValid: emailRegex.test(email),
      emailType: typeof email,
      emailLength: email.length
    });

    if (!emailRegex.test(email)) {
      console.log('Geçersiz email formatı:', email);
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

    console.log('=== VERİTABANI BAĞLANTISI ===');
    // Veritabanı bağlantısı
    try {
      await connectDB();
      console.log('Veritabanı bağlantısı başarılı');
    } catch (error) {
      console.error('Veritabanı bağlantı hatası:', error);
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

    console.log('=== KULLANICI ARAMA ===');
    // Kullanıcıyı bul
    let user;
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log('Normalize edilmiş email ile arama:', normalizedEmail);
      
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      console.log('Kullanıcı arama sonucu:', user ? {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        createdAt: user.createdAt
      } : 'Kullanıcı bulunamadı');
      
      if (!user) {
        console.log('Email ile kullanıcı bulunamadı:', normalizedEmail);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { 
            status: 404,
            headers: {
              'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      console.log('=== ŞİFRE KONTROLÜ ===');
      console.log('Şifre karşılaştırması başlıyor');
      console.log('Gelen şifre detayları:', {
        length: password.length,
        firstThree: password.substring(0, 3)
      });
      console.log('Kayıtlı şifre detayları:', {
        exists: !!user.password,
        length: user.password?.length,
        firstThree: user.password?.substring(0, 3)
      });

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Şifre karşılaştırma sonucu:', isMatch);
      
      if (!isMatch) {
        console.log('Şifre eşleşmedi. Kullanıcı:', email);
        return NextResponse.json(
          { error: 'Email veya şifre hatalı.' },
          { 
            status: 405,
            headers: {
              'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }

      console.log('=== GİRİŞ BAŞARILI ===');
      console.log('Kullanıcı girişi başarılı:', {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      });

      console.log('=== JWT TOKEN OLUŞTURMA ===');
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
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