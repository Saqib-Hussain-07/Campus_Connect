const mongoose = require('mongoose');

const eventRsvpSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['going', 'interested', 'not_going'],
    default: 'going'
  }
}, { timestamps: true });

eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventRsvp', eventRsvpSchema);
