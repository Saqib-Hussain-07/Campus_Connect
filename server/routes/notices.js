const express = require('express');
const Notice = require('../models/Notice');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

// List notices (active, sorted by pinned first, then created date)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('userId', 'name department avatar');

    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notices', error: err.message });
  }
});

// Post Notice
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, category, tags, expiresAt, isPinned } = req.body;
    const userId = req.user.id;

    const notice = await Notice.create({
      userId,
      title,
      body,
      category: category || 'general',
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isPinned: Boolean(isPinned)
    });

    // Log Activity
    await Activity.create({
      userId,
      type: 'notice_posted',
      refId: notice._id,
      refTitle: notice.title
    });

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post notice', error: err.message });
  }
});

// Toggle Pinned status
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    // Check if user is the post author or maybe admin (here author check is sufficient)
    if (notice.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to pin this notice' });
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pin status', error: err.message });
  }
});

module.exports = router;
