const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure uniqueness per connection pair
connectionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
connectionSchema.index({ toUser: 1, status: 1 });
connectionSchema.index({ fromUser: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
