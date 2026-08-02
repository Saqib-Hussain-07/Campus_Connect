const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Message body cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: { type: String, required: true },
    fileType: { type: String, default: 'file' },
    originalName: String
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ fromUser: 1, toUser: 1, createdAt: -1 });
messageSchema.index({ toUser: 1, isRead: 1, isDeleted: 1 });

module.exports = mongoose.model('Message', messageSchema);
