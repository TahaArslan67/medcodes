import nodemailer from 'nodemailer';

// E-posta göndermek için transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Doğrulama kodu oluştur
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Doğrulama e-postası gönder
export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'E-posta Doğrulama Kodu - MedCodes',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">MedCodes E-posta Doğrulama</h2>
        <p style="color: #666; font-size: 16px;">Merhaba,</p>
        <p style="color: #666; font-size: 16px;">MedCodes'a kayıt olduğunuz için teşekkür ederiz. Lütfen aşağıdaki doğrulama kodunu kullanarak e-posta adresinizi doğrulayın:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">Bu kod 10 dakika süreyle geçerlidir.</p>
        <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
};
