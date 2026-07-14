const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['opportunity', 'academic', 'internship', 'placement', 'general', 'urgent'], default: 'general' },
  tags: [String],
  expiresAt: Date,
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
