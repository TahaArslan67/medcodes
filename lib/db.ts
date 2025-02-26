import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://arslantaha67:00228t@panel.gjn1k.mongodb.net/MDB?retryWrites=true&w=majority&appName=Panel';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    return mongoose.connection;
  } catch (error) {
    throw error;
  }
}; 