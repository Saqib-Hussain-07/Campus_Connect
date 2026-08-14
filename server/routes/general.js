const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Connection = require('../models/Connection');
const Newsletter = require('../models/Newsletter');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { buildSafeRegexQuery } = require('../utils/regex');
const cache = require('../utils/cache');

const { contactLimiter, newsletterLimiter } = require('../middleware/rateLimiter');
const { contactRules, newsletterRules } = require('../validators/contact.validator');

const router = express.Router();

// Newsletter Subscription (With dedicated rate limiting, validation & honeypot spam protection)
router.post('/newsletter', newsletterLimiter, newsletterRules, asyncHandler(async (req, res) => {
  const { email, hp, website, honeypot } = req.body;

  // Silent drop for automated spam bots filling hidden honeypot fields
  if (hp || website || honeypot) {
    return sendSuccess(res, null, 'Subscribed successfully!');
  }

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    return sendSuccess(res, null, 'You are already subscribed to our newsletter.');
  }

  await Newsletter.create({ email: email.toLowerCase() });
  return sendSuccess(res, null, 'Subscribed successfully!');
}));

// Contact Message Submit (With dedicated rate limiting, validation & honeypot spam protection)
router.post('/contact', contactLimiter, contactRules, asyncHandler(async (req, res) => {
  const { name, email, subject, message, hp, website, honeypot } = req.body;

  // Silent drop for automated spam bots filling hidden honeypot fields
  if (hp || website || honeypot) {
    return sendSuccess(res, null, 'Message sent successfully. Thank you!');
  }

  await ContactMessage.create({ name, email, subject, message });
  return sendSuccess(res, null, 'Message sent successfully. Thank you!');
}));

// Leaderboard Ranking (With MongoDB Aggregation Pipelines & 120s TTL Cache)
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const cachedData = cache.get('leaderboard_data');
  if (cachedData) {
    return sendSuccess(res, cachedData, 'Leaderboard data fetched successfully (cached)');
  }

  // 1. Top Builders (Project count + likes)
  const topBuilders = await Project.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$userId',
        project_count: { $sum: 1 },
        total_likes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
      }
    },
    { $sort: { total_likes: -1, project_count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        name: '$user.name',
        department: '$user.department',
        university: '$user.university',
        avatar: '$user.avatar',
        project_count: 1,
        total_likes: 1
      }
    }
  ]);

  // 2. Most Connected via Connection aggregation
  const topConnected = await Connection.aggregate([
    { $match: { status: 'accepted' } },
    {
      $project: {
        users: ['$fromUser', '$toUser']
      }
    },
    { $unwind: '$users' },
    {
      $group: {
        _id: '$users',
        conn_count: { $sum: 1 }
      }
    },
    { $sort: { conn_count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        name: '$user.name',
        department: '$user.department',
        university: '$user.university',
        skills: '$user.skills',
        avatar: '$user.avatar',
        is_online: '$user.isOnline',
        conn_count: 1
      }
    }
  ]);

  // 3. Most Endorsed via User aggregation
  const topEndorsed = await User.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        name: 1,
        department: 1,
        university: 1,
        skills: 1,
        avatar: 1,
        endorse_count: { $size: { $ifNull: ['$endorsements', []] } }
      }
    },
    { $sort: { endorse_count: -1 } },
    { $limit: 10 },
    {
      $project: {
        id: '$_id',
        name: 1,
        department: 1,
        university: 1,
        skills: 1,
        avatar: 1,
        endorse_count: 1
      }
    }
  ]);

  // 4. Most Active (Group participation aggregation)
  const topGroupers = await Group.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $unwind: '$members' },
    {
      $group: {
        _id: '$members',
        group_count: { $sum: 1 }
      }
    },
    { $sort: { group_count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        name: '$user.name',
        department: '$user.department',
        university: '$user.university',
        avatar: '$user.avatar',
        group_count: 1
      }
    }
  ]);

  const payload = {
    connections: topConnected,
    builders: topBuilders,
    endorsed: topEndorsed,
    groupers: topGroupers
  };

  cache.set('leaderboard_data', payload, 120);
  return sendSuccess(res, payload, 'Leaderboard data fetched successfully');
}));

// Global Search (With Safe Regex & parallel lean execution)
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const safeRegex = buildSafeRegexQuery(q);

  if (!safeRegex) {
    return sendSuccess(res, { students: [], projects: [], groups: [], events: [] }, 'Search results');
  }

  const [students, projects, groups, events] = await Promise.all([
    User.find({
      isDeleted: { $ne: true },
      $or: [
        { name: safeRegex },
        { department: safeRegex },
        { university: safeRegex },
        { skills: safeRegex }
      ]
    }).select('name department university skills avatar isOnline').limit(6).lean(),

    Project.find({
      isDeleted: { $ne: true },
      $or: [
        { title: safeRegex },
        { description: safeRegex },
        { techStack: safeRegex }
      ]
    }).populate('userId', 'name department avatar').limit(6).lean(),

    Group.find({
      isDeleted: { $ne: true },
      $or: [
        { name: safeRegex },
        { description: safeRegex }
      ]
    }).populate('createdBy', 'name department avatar').limit(6).lean(),

    Event.find({
      isDeleted: { $ne: true },
      $or: [
        { title: safeRegex },
        { description: safeRegex },
        { venue: safeRegex }
      ]
    }).populate('userId', 'name department avatar').limit(6).lean()
  ]);

  return sendSuccess(res, { students, projects, groups, events }, 'Search results');
}));

module.exports = router;
