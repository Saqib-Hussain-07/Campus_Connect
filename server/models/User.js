const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'alumni', 'admin'],
    default: 'student',
    index: true
  },
  registrationNo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [12, 'Semester cannot exceed 12']
  },
  university: {
    type: String,
    trim: true,
    maxlength: [150, 'University name cannot exceed 150 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  verifyToken: String,
  resetExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: {
    type: Date,
    default: null
  },
  lastFailedLogin: {
    type: Date,
    default: null
  },
  endorsements: [{
    skill: { type: String, required: true, trim: true, maxlength: 50 },
    endorserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.index({ department: 1, semester: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ isDeleted: 1, isOnline: -1, name: 1 });
userSchema.index({ department: 1, semester: 1, isDeleted: 1 });

module.exports = mongoose.model('User', userSchema);
