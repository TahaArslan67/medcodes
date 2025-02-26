import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur']
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur']
  },
  imageUrl: {
    type: String,
    required: [true, 'Resim URL zorunludur'],
    default: '/images/default-project.jpg' // Varsayılan resim
  },
  technologies: [{
    type: String,
    required: true
  }],
  demoUrl: {
    type: String
  },
  githubUrl: {
    type: String
  },
  category: {
    type: String,
    enum: ['Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Diğer'],
    required: [true, 'Kategori zorunludur'],
    default: 'Genel' // Varsayılan kategori
  },
  status: {
    type: String,
    enum: ['Devam Ediyor', 'Tamamlandı', 'Planlanıyor'],
    default: 'Devam Ediyor'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Güncelleme tarihini otomatik güncelle
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project; 