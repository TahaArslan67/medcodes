import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    console.log('=== ŞİFRE KARŞILAŞTIRMA DETAYLARI ===');
    console.log('Gelen şifre bilgileri:', {
      length: candidatePassword.length,
      firstThree: candidatePassword.substring(0, 3),
      isEmpty: !candidatePassword,
      type: typeof candidatePassword
    });

    console.log('Kayıtlı şifre bilgileri:', {
      length: this.password?.length,
      firstThree: this.password?.substring(0, 3),
      isEmpty: !this.password,
      type: typeof this.password
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('bcrypt.compare sonucu:', isMatch);
    
    if (!isMatch) {
      console.log('Şifre eşleşmedi:', {
        candidateLength: candidatePassword.length,
        storedLength: this.password.length
      });
    } else {
      console.log('Şifre eşleşti');
    }

    return isMatch;
  } catch (error) {
    console.error('Şifre karşılaştırma hatası:', error);
    return false;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;