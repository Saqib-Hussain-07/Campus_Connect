const express = require('express');
const Resource = require('../models/Resource');
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// List resources (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { department, semester, search, type } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name department avatar');

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load resources', error: err.message });
  }
});

// Share Resource
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, type, url, department, semester } = req.body;
    const userId = req.user.id;

    const resource = await Resource.create({
      userId,
      title,
      description,
      subject,
      type: type || 'other',
      url,
      department,
      semester: semester ? Number(semester) : undefined
    });

    // Log Activity
    await Activity.create({
      userId,
      type: 'resource_shared',
      refId: resource._id,
      refTitle: resource.title
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to share resource', error: err.message });
  }
});

// Toggle Resource Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const userId = req.user.id;
    const likeIdx = resource.likes.indexOf(userId);

    if (likeIdx > -1) {
      resource.likes.splice(likeIdx, 1);
      await resource.save();
      res.json({ message: 'Unliked resource', likesCount: resource.likes.length, isLiked: false });
    } else {
      resource.likes.push(userId);
      await resource.save();
      res.json({ message: 'Liked resource', likesCount: resource.likes.length, isLiked: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update resource like', error: err.message });
  }
});

module.exports = router;
