const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Project title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Project description cannot exceed 5000 characters']
  },
  techStack: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  githubUrl: {
    type: String,
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['web', 'mobile', 'ai_ml', 'iot_hardware', 'research', 'other'],
    default: 'other',
    index: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'archived'],
    default: 'in_progress',
    index: true
  },
  teamSize: {
    type: Number,
    min: [1, 'Team size must be at least 1'],
    max: [50, 'Team size cannot exceed 50'],
    default: 1
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    min: 0,
    default: 0
  },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now }
  }],
  requests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ category: 1, createdAt: -1 });
projectSchema.index({ isDeleted: 1, createdAt: -1 });
projectSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
projectSchema.index({ category: 1, isDeleted: 1 });

module.exports = mongoose.model('Project', projectSchema);
