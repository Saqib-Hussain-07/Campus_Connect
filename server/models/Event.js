const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Event description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    enum: ['hackathon', 'seminar', 'workshop', 'competition', 'other'],
    default: 'other',
    index: true
  },
  venue: {
    type: String,
    trim: true,
    maxlength: [250, 'Venue text cannot exceed 250 characters']
  },
  eventDate: {
    type: Date,
    required: true,
    index: true
  },
  registrationDeadline: Date,
  maxAttendees: {
    type: Number,
    min: [0, 'Max attendees cannot be negative'],
    max: [10000, 'Max attendees cannot exceed 10,000'],
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  bannerSeed: {
    type: String,
    default: 'ev1'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date
}, { timestamps: true });

eventSchema.index({ category: 1, eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
