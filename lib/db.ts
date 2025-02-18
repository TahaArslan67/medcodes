import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://arslantaha67:00228t@panel.gjn1k.mongodb.net/MDB?retryWrites=true&w=majority&appName=Panel';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('MongoDB zaten bağlı');
      return;
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB bağlantısı başarılı!');
    console.log('Bağlantı detayları:', {
      host: conn.connection.host,
      name: conn.connection.name,
      models: Object.keys(conn.models)
    });

    return conn;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}; 