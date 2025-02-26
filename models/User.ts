import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad Soyad alanı zorunludur'],
    minlength: [2, 'Ad Soyad en az 2 karakter olmalıdır'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// Doğrulama kodunun geçerli olup olmadığını kontrol et
userSchema.methods.isVerificationCodeValid = function(code: string): boolean {
  return (
    this.verificationCode === code &&
    this.verificationCodeExpires > new Date()
  );
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;