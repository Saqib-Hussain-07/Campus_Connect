const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

// Get list of notifications for current user
router.get('/', auth, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .populate('actorId', 'name department avatar')
    .sort({ createdAt: -1 })
    .limit(30);

  return sendSuccess(res, notifications, 'Notifications fetched successfully');
}));

// Mark all as read
router.post('/mark-read', auth, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  return sendSuccess(res, null, 'All notifications marked as read');
}));

module.exports = router;
