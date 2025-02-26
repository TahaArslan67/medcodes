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

    const { name, email, password, recaptchaToken } = await req.json();

    // reCAPTCHA doğrulama
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: 'reCAPTCHA doğrulaması başarısız' },
        { status: 400 }
      );
    }

    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Doğrulama kodu oluştur
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika geçerli

    // Kullanıcıyı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });

    // Doğrulama e-postası gönder
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // E-posta gönderilemezse kullanıcıyı sil
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        { error: 'Doğrulama e-postası gönderilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.',
      email
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}