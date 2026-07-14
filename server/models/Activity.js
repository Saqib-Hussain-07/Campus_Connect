const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['project_added', 'event_created', 'notice_posted', 'resource_shared', 'connected', 'joined_group', 'endorsed'],
    required: true
  },
  refId: mongoose.Schema.Types.ObjectId,
  refTitle: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
