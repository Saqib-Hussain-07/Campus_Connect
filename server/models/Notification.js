const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recipient
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Trigger user
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'project_like',
      'project_comment',
      'project_join_request',
      'endorsement',
      'event_reminder',
      'notice_new',
      'message_new'
    ],
    required: true
  },
  refId: mongoose.Schema.Types.ObjectId,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
