const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Group description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['study', 'project', 'forum', 'club', 'other'],
    default: 'study',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'recruiting', 'open', 'archived'],
    default: 'active',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

groupSchema.index({ type: 1, createdAt: -1 });
groupSchema.index({ status: 1, createdAt: -1 });
groupSchema.index({ createdBy: 1, createdAt: -1 });
groupSchema.index({ members: 1, isDeleted: 1 });
groupSchema.index({ type: 1, isDeleted: 1, createdAt: -1 });
groupSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model('Group', groupSchema);
