const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  subject: String,
  type: { type: String, enum: ['notes', 'video', 'book', 'article', 'tool', 'other'], default: 'other' },
  url: String,
  department: String,
  semester: Number,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);
