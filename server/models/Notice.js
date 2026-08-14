const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
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
    maxlength: [200, 'Notice title cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Notice body cannot exceed 5000 characters']
  },
  category: {
    type: String,
    enum: ['opportunity', 'academic', 'internship', 'placement', 'general', 'urgent'],
    default: 'general',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  expiresAt: {
    type: Date,
    index: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    min: 0,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ category: 1, createdAt: -1 });
noticeSchema.index({ userId: 1, createdAt: -1 });
noticeSchema.index({ expiresAt: 1 });
noticeSchema.index({ isDeleted: 1, expiresAt: 1, isPinned: -1, createdAt: -1 });
noticeSchema.index({ isDeleted: 1, category: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
