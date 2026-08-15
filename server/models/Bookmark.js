const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    itemType: {
      type: String,
      enum: ['project', 'event', 'group', 'resource'],
      required: true,
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate bookmarks by the same user for the same item
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
