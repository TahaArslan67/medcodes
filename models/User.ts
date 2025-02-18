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
      console.log('Şifre eşleşmesi başarılı');
    }

    return isMatch;
  } catch (error) {
    console.error('Şifre karşılaştırma hatası:', {
      error,
      candidatePassword: {
        exists: !!candidatePassword,
        length: candidatePassword?.length
      },
      storedPassword: {
        exists: !!this.password,
        length: this.password?.length
      }
    });
    return false;
  }
};

// Kaydetmeden önce şifreyi hashle
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Şifre değişmemiş, hash işlemi atlanıyor');
    return next();
  }
  
  console.log('=== ŞİFRE HASH İŞLEMİ ===');
  console.log('Hash öncesi şifre bilgileri:', {
    length: this.password.length,
    firstThree: this.password.substring(0, 3),
    isEmpty: !this.password,
    type: typeof this.password
  });

  try {
    const salt = await bcrypt.genSalt(10);
    console.log('Salt oluşturuldu');
    
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Hash sonrası şifre bilgileri:', {
      length: this.password.length,
      firstThree: this.password.substring(0, 3),
      isEmpty: !this.password,
      type: typeof this.password
    });
    
    next();
  } catch (error) {
    console.error('Şifre hash hatası:', error);
    next(error as mongoose.CallbackError);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 