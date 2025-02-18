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
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    console.log('Password comparison details:', {
      candidatePasswordLength: candidatePassword.length,
      candidatePasswordFirstThree: candidatePassword.substring(0, 3),
      storedPasswordLength: this.password.length,
      storedPasswordFirstThree: this.password.substring(0, 3)
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('bcrypt.compare result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Kaydetmeden önce şifreyi hashle
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }
  
  console.log('Hashing password:', {
    originalLength: this.password.length,
    originalFirstThree: this.password.substring(0, 3)
  });

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  console.log('Password hashed:', {
    hashedLength: this.password.length,
    hashedFirstThree: this.password.substring(0, 3)
  });

  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 