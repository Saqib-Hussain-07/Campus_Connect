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
const cache = require('../utils/cache');

const router = express.Router();

// Newsletter Subscription
router.post('/newsletter', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, 'Email is required', 400);

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return sendSuccess(res, null, 'You are already subscribed to our newsletter.');
  }

  await Newsletter.create({ email });
  return sendSuccess(res, null, 'Subscribed successfully!');
}));

// Contact Message Submit
router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return sendError(res, 'Name, email, and message are required', 400);
  }

  await ContactMessage.create({ name, email, subject, message });
  return sendSuccess(res, null, 'Message sent successfully. Thank you!');
}));

// Leaderboard Ranking (With Redis-ready TTL Cache & MongoDB Aggregation Pipelines)
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const cachedData = cache.get('leaderboard_data');
  if (cachedData) {
    return sendSuccess(res, cachedData, 'Leaderboard data fetched successfully (cached)');
  }

  // 1. Top Builders via MongoDB Aggregation Pipeline
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

  const allUsers = await User.find({ isDeleted: { $ne: true } }).select('name department university skills avatar endorsements isOnline');
  const allConnections = await Connection.find({ status: 'accepted' });
  const allGroups = await Group.find({ isDeleted: { $ne: true } });

  // 2. Most Connected
  const topConnected = allUsers.map((user) => {
    const uId = user._id.toString();
    const connCount = allConnections.filter(
      (c) => c.fromUser.toString() === uId || c.toUser.toString() === uId
    ).length;

    return {
      id: user._id,
      name: user.name,
      department: user.department,
      university: user.university,
      skills: user.skills,
      avatar: user.avatar,
      is_online: user.isOnline,
      conn_count: connCount
    };
  }).sort((a, b) => b.conn_count - a.conn_count).slice(0, 10);

  // 3. Most Endorsed
  const topEndorsed = allUsers.map((user) => {
    const endorseCount = (user.endorsements || []).length;
    const skills = Array.from(new Set((user.endorsements || []).map((e) => e.skill))).join(', ');

    return {
      id: user._id,
      name: user.name,
      department: user.department,
      university: user.university,
      skills: user.skills,
      avatar: user.avatar,
      endorse_count: endorseCount,
      endorsed_skills: skills
    };
  }).sort((a, b) => b.endorse_count - a.endorse_count).slice(0, 10);

  // 4. Most Active (Group participation)
  const topGroupers = allUsers.map((user) => {
    const uId = user._id.toString();
    const groupCount = allGroups.filter((g) => g.members.some((m) => m.toString() === uId)).length;

    return {
      id: user._id,
      name: user.name,
      department: user.department,
      university: user.university,
      avatar: user.avatar,
      group_count: groupCount
    };
  }).sort((a, b) => b.group_count - a.group_count).slice(0, 10);

  const payload = {
    connections: topConnected,
    builders: topBuilders,
    endorsed: topEndorsed,
    groupers: topGroupers
  };

  // Cache payload for 120 seconds
  cache.set('leaderboard_data', payload, 120);

  return sendSuccess(res, payload, 'Leaderboard data fetched successfully');
}));

// Global Search
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return sendSuccess(res, { students: [], projects: [], groups: [], events: [] }, 'Search results');
  }

  const reg = new RegExp(q, 'i');

  const students = await User.find({
    isDeleted: { $ne: true },
    $or: [
      { name: reg },
      { department: reg },
      { university: reg },
      { skills: reg }
    ]
  }).select('name department university skills avatar isOnline').limit(6);

  const projects = await Project.find({
    isDeleted: { $ne: true },
    $or: [
      { title: reg },
      { description: reg },
      { techStack: reg }
    ]
  }).populate('userId', 'name department avatar').limit(6);

  const groups = await Group.find({
    isDeleted: { $ne: true },
    $or: [
      { name: reg },
      { description: reg }
    ]
  }).populate('createdBy', 'name department avatar').limit(6);

  const events = await Event.find({
    isDeleted: { $ne: true },
    $or: [
      { title: reg },
      { description: reg },
      { venue: reg }
    ]
  }).populate('userId', 'name department avatar').limit(6);

  return sendSuccess(res, { students, projects, groups, events }, 'Search results');
}));

module.exports = router;
