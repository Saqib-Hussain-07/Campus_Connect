const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
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
    maxlength: [200, 'Resource title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [3000, 'Resource description cannot exceed 3000 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['notes', 'video', 'book', 'article', 'tool', 'other'],
    default: 'other',
    index: true
  },
  url: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [12, 'Semester cannot exceed 12']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

resourceSchema.index({ type: 1, department: 1, semester: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
