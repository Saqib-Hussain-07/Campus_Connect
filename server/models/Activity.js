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

activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
