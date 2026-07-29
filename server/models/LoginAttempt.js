const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  failedCount: { type: Number, default: 0 },
  attemptsInCurrentPhase: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  lastLockoutDurationMinutes: { type: Number, default: 0 }
}, { timestamps: true });

loginAttemptSchema.index({ ip: 1, email: 1 }, { unique: true });
loginAttemptSchema.index({ lockoutUntil: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
