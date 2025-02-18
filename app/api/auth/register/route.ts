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
    console.log('=== KAYIT İSTEĞİ BAŞLADI ===');
    const body = await request.json();
    const { name, email, password, recaptchaToken } = body;

    console.log('Gelen veriler:', { 
      name,
      email,
      passwordLength: password?.length,
      hasRecaptcha: !!recaptchaToken
    });

    // Validasyon
    if (!name || !email || !password || !recaptchaToken) {
      const missingFields = {
        name: !name,
        email: !email,
        password: !password,
        recaptchaToken: !recaptchaToken
      };
      console.log('Eksik alanlar:', missingFields);
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

    // İsim kontrolü
    const trimmedName = name.trim();
    console.log('İsim kontrolü:', {
      originalName: name,
      trimmedName,
      length: trimmedName.length
    });

    if (!trimmedName || trimmedName.length < 2) {
      console.log('Geçersiz isim:', name);
      return NextResponse.json(
        { error: 'İsim en az 2 karakter olmalıdır ve boş bırakılamaz.' },
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

    // Şifre kontrolü
    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
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
      console.error('reCAPTCHA verification error:', error);
      return NextResponse.json(
        { error: 'reCAPTCHA doğrulama hatası.' },
        { 
          status: 500,
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

    // Email kontrolü
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı.' },
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
      console.error('Kullanıcı kontrolü hatası:', error);
      return NextResponse.json(
        { error: 'Kullanıcı kontrolü sırasında bir hata oluştu.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifreyi hashle
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.error('Şifre hashleme hatası:', error);
      return NextResponse.json(
        { error: 'Şifre işleme hatası.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Yeni kullanıcı oluştur
    let user;
    try {
      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword
      });

      if (!user.name) {
        throw new Error('İsim alanı kaydedilemedi');
      }

      console.log('Kullanıcı oluşturuldu:', {
        id: user._id,
        name: user.name,
        email: user.email
      });

    } catch (error: any) {
      console.error('Kullanıcı oluşturma hatası:', error);
      return NextResponse.json(
        { 
          error: 'Kullanıcı oluşturma hatası.',
          details: error.message
        },
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
        { 
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.medcodes.systems',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
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
    console.error('Registration error details:', error);
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