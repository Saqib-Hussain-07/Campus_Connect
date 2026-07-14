const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Connection = require('../models/Connection');
const Newsletter = require('../models/Newsletter');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// Newsletter Subscription
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.json({ message: 'You are already subscribed to our newsletter.' });
    }

    await Newsletter.create({ email });
    res.json({ message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to subscribe', error: err.message });
  }
});

// Contact Message Submit
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await ContactMessage.create({ name, email, subject, message });
    res.json({ message: 'Message sent successfully. Thank you!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit contact request', error: err.message });
  }
});

// Leaderboard Ranking
router.get('/leaderboard', async (req, res) => {
  try {
    const allUsers = await User.find().select('name department university skills avatar endorsements isOnline');
    const allConnections = await Connection.find({ status: 'accepted' });
    const allProjects = await Project.find();
    const allGroups = await Group.find();

    // 1. Most Connected
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

    // 2. Top Builders
    const topBuilders = allUsers.map((user) => {
      const uId = user._id.toString();
      const userProjects = allProjects.filter((p) => p.userId.toString() === uId);
      const projectCount = userProjects.length;
      const totalLikes = userProjects.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0);

      return {
        id: user._id,
        name: user.name,
        department: user.department,
        university: user.university,
        avatar: user.avatar,
        project_count: projectCount,
        total_likes: totalLikes
      };
    }).filter((u) => u.project_count > 0)
      .sort((a, b) => b.total_likes - a.total_likes || b.project_count - a.project_count)
      .slice(0, 10);

    // 3. Most Endorsed
    const topEndorsed = allUsers.map((user) => {
      const endorseCount = user.endorsements.length;
      const skills = Array.from(new Set(user.endorsements.map((e) => e.skill))).join(', ');

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

    res.json({
      connections: topConnected,
      builders: topBuilders,
      endorsed: topEndorsed,
      groupers: topGroupers
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load leaderboard', error: err.message });
  }
});

// Global Search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ students: [], projects: [], groups: [], events: [] });
    }

    const reg = new RegExp(q, 'i');

    const students = await User.find({
      $or: [
        { name: reg },
        { department: reg },
        { university: reg },
        { skills: reg }
      ]
    }).select('name department university skills avatar isOnline').limit(6);

    const projects = await Project.find({
      $or: [
        { title: reg },
        { description: reg },
        { techStack: reg }
      ]
    }).populate('userId', 'name department').limit(6);

    const groups = await Group.find({
      $or: [
        { name: reg },
        { description: reg }
      ]
    }).populate('createdBy', 'name').limit(6);

    const events = await Event.find({
      $or: [
        { title: reg },
        { description: reg },
        { venue: reg }
      ]
    }).populate('userId', 'name').limit(6);

    res.json({ students, projects, groups, events });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = router;
