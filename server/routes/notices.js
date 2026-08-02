const express = require('express');
const Notice = require('../models/Notice');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { cache, cacheMiddleware } = require('../utils/cache');

const router = express.Router();

// List notices with pagination & caching
router.get('/', cacheMiddleware(60), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = {
    isDeleted: { $ne: true },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [total, notices] = await Promise.all([
    Notice.countDocuments(query),
    Notice.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name department avatar')
      .lean()
  ]);

  return sendPaginated(res, notices, pageNum, limitNum, total, 'Notices loaded successfully');
}));

// Post Notice
router.post('/', auth, asyncHandler(async (req, res) => {
  const { title, body, category, tags, expiresAt, isPinned } = req.body;
  if (!title || !body) return sendError(res, 'Title and notice body are required', 400);

  const userId = req.user.id;

  const notice = await Notice.create({
    userId,
    title: title.trim(),
    body: body.trim(),
    category: category || 'general',
    tags: Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    isPinned: Boolean(isPinned)
  });

  await Activity.create({
    userId,
    type: 'notice_posted',
    refId: notice._id,
    refTitle: notice.title
  });

  cache.delByPattern('/api/notices');
  cache.delByPattern('/api/home');

  return sendSuccess(res, notice, 'Notice posted successfully', 201);
}));

// Toggle Pinned status
router.put('/:id/pin', auth, asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return sendError(res, 'Notice not found', 404);

  if (notice.userId.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized to pin this notice', 403);
  }

  notice.isPinned = !notice.isPinned;
  await notice.save();

  cache.delByPattern('/api/notices');
  cache.delByPattern('/api/home');

  return sendSuccess(res, notice, `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`);
}));

module.exports = router;
