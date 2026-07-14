const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  category: { type: String, default: 'other' },
  venue: String,
  eventDate: { type: Date, required: true },
  registrationDeadline: Date,
  maxAttendees: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  bannerSeed: { type: String, default: 'ev1' },
  rsvps: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['going', 'interested', 'not_going'], default: 'going' },
    rsvpedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
