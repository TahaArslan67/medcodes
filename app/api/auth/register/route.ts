import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/mail';

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

    const { name, email, password } = await req.json();

    // Validasyon
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    // Email kullanımda mı kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifre hash'leme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Doğrulama kodu oluşturma
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    // Kullanıcı oluşturma
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });

    // Doğrulama e-postası gönderme
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (error) {
      console.error('Email gönderme hatası:', error);
      // Kullanıcıyı sil
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        { error: 'Doğrulama e-postası gönderilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Kayıt başarılı. Lütfen email adresinizi doğrulayın.',
      redirectUrl: `/auth/verify?email=${encodeURIComponent(email)}`
    });

  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}