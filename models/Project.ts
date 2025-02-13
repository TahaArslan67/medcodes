import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
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
    required: true
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
});

// Güncelleme tarihini otomatik güncelle
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project; 