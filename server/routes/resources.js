const express = require('express');
const Resource = require('../models/Resource');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { resourceRules } = require('../middleware/validators');

const router = express.Router();

// List resources (with optional filters and pagination)
router.get('/', asyncHandler(async (req, res) => {
  const { department, semester, search, type, page = 1, limit = 10 } = req.query;
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

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Resource.countDocuments(query);
  const resources = await Resource.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('userId', 'name department avatar');

  return sendPaginated(res, resources, pageNum, limitNum, total, 'Resources retrieved successfully');
}));

// Share Resource
router.post('/', auth, resourceRules, asyncHandler(async (req, res) => {
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

  await Activity.create({
    userId,
    type: 'resource_shared',
    refId: resource._id,
    refTitle: resource.title
  });

  return sendSuccess(res, resource, 'Resource shared successfully', 201);
}));

// Toggle Resource Like
router.post('/:id/like', auth, asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return sendError(res, 'Resource not found', 404);

  const userId = req.user.id;
  const likeIdx = resource.likes.indexOf(userId);

  if (likeIdx > -1) {
    resource.likes.splice(likeIdx, 1);
    await resource.save();
    return sendSuccess(res, { likesCount: resource.likes.length, isLiked: false }, 'Unliked resource');
  } else {
    resource.likes.push(userId);
    await resource.save();
    return sendSuccess(res, { likesCount: resource.likes.length, isLiked: true }, 'Liked resource');
  }
}));

module.exports = router;
