const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  registrationNo: { type: String, unique: true, sparse: true, trim: true },
  department: String,
  semester: Number,
  university: String,
  skills: [String],
  bio: String,
  avatar: { type: String, default: 'default.jpg' },
  isVerified: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  verifyToken: String,
  verifyExpires: Date,
  resetToken: String,
  resetExpires: Date,
  endorsements: [{
    skill: { type: String, required: true },
    endorserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
