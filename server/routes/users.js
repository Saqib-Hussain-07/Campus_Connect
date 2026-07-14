const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

// Get users list (with optional query filters: search, department, university, skill)
router.get('/', async (req, res) => {
  try {
    const { search, department, university, semester, skill } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (department) {
      query.department = department;
    }
    if (university) {
      query.university = university;
    }
    if (semester) {
      query.semester = Number(semester);
    }
    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    const users = await User.find(query).select('-password').sort({ isOnline: -1, name: 1 }).limit(24);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, semester, university, skills, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (semester !== undefined) user.semester = semester ? Number(semester) : undefined;
    if (university !== undefined) user.university = university;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar; // accepts filename or base64
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : typeof skills === 'string' && skills
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// Check connection status with a user
router.get('/connections/status/:id', auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const theirId = req.params.id;

    const conn = await Connection.findOne({
      $or: [
        { fromUser: myId, toUser: theirId },
        { fromUser: theirId, toUser: myId }
      ]
    });

    if (!conn) return res.json({ status: null });
    res.json({ status: conn.status, connectionId: conn._id, fromUser: conn.fromUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch connection status' });
  }
});

// Get user profile details by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch user groups
    const groups = await Group.find({ members: user._id }).limit(6).select('name type status');

    // Fetch user projects
    const projects = await Project.find({ userId: user._id }).sort({ likes: -1 }).limit(4);

    // Compute endorsement counts grouped by skill
    const endorsementCounts = {};
    user.skills.forEach(skill => {
      endorsementCounts[skill] = 0;
    });
    user.endorsements.forEach(e => {
      if (endorsementCounts[e.skill] !== undefined) {
        endorsementCounts[e.skill]++;
      } else {
        endorsementCounts[e.skill] = 1;
      }
    });

    const endorsements = Object.keys(endorsementCounts).map(skill => ({
      skill,
      cnt: endorsementCounts[skill]
    })).sort((a, b) => b.cnt - a.cnt);

    res.json({
      profile: user,
      groups,
      projects,
      endorsements
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student details', error: err.message });
  }
});

// Toggle Skill Endorsement
router.post('/:id/endorse', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const endorserId = req.user.id;
    const { skill } = req.body;

    if (!skill) return res.status(400).json({ message: 'Skill is required' });
    if (targetUserId === endorserId) return res.status(400).json({ message: 'Cannot endorse yourself' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if endorser is a connection
    const connected = await Connection.findOne({
      $or: [
        { fromUser: endorserId, toUser: targetUserId },
        { fromUser: targetUserId, toUser: endorserId }
      ],
      status: 'accepted'
    });
    if (!connected) return res.status(400).json({ message: 'You must be connected to endorse skills' });

    const endorser = await User.findById(endorserId);

    const existingIdx = targetUser.endorsements.findIndex(
      (e) => e.skill.toLowerCase() === skill.toLowerCase() && e.endorserId.toString() === endorserId
    );

    if (existingIdx > -1) {
      // Remove endorsement
      targetUser.endorsements.splice(existingIdx, 1);
      await targetUser.save();
      return res.json({ message: `Unendorsed ${skill}`, user: targetUser });
    } else {
      // Add endorsement
      targetUser.endorsements.push({ skill, endorserId });
      await targetUser.save();

      // Create Notification
      await Notification.create({
        userId: targetUserId,
        actorId: endorserId,
        type: 'endorsement',
        message: `${endorser.name} endorsed you for "${skill}"`
      });

      // Create Activity
      await Activity.create({
        userId: endorserId,
        type: 'endorsed',
        refId: targetUserId,
        refTitle: targetUser.name
      });

      return res.json({ message: `Endorsed ${skill}`, user: targetUser });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update endorsement', error: err.message });
  }
});

// Send Connection Request
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const fromUser = req.user.id;
    const toUser = req.params.id;

    if (fromUser === toUser) return res.status(400).json({ message: 'Cannot connect with yourself' });

    // Check if existing connection
    const existing = await Connection.findOne({
      $or: [
        { fromUser, toUser },
        { fromUser: toUser, toUser: fromUser }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Connection already exists or is pending' });
    }

    const conn = await Connection.create({ fromUser, toUser, status: 'pending' });
    const me = await User.findById(fromUser);

    // Notification to recipient
    await Notification.create({
      userId: toUser,
      actorId: fromUser,
      type: 'connection_request',
      refId: conn._id,
      message: `${me.name} sent you a connection request`
    });

    res.status(201).json({ message: 'Connection request sent successfully', connection: conn });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send connection request', error: err.message });
  }
});

// Accept/Reject Connection Request
router.post('/connections/:connId/respond', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const connId = req.params.connId;
    const myId = req.user.id;

    const conn = await Connection.findById(connId);
    if (!conn) return res.status(404).json({ message: 'Connection request not found' });

    if (conn.toUser.toString() !== myId) {
      return res.status(403).json({ message: 'Unauthorized to respond to this request' });
    }

    if (action === 'accept') {
      conn.status = 'accepted';
      await conn.save();

      const sender = await User.findById(conn.fromUser);
      const recipient = await User.findById(myId);

      // Notification to sender
      await Notification.create({
        userId: conn.fromUser,
        actorId: myId,
        type: 'connection_accepted',
        refId: conn._id,
        message: `${recipient.name} accepted your connection request`
      });

      // Activities for both
      await Activity.create({
        userId: conn.fromUser,
        type: 'connected',
        refId: myId,
        refTitle: recipient.name
      });
      await Activity.create({
        userId: myId,
        type: 'connected',
        refId: conn.fromUser,
        refTitle: sender.name
      });

      // Remove the notification about the connection request since it's processed
      await Notification.deleteOne({ userId: myId, refId: conn._id, type: 'connection_request' });

      res.json({ message: 'Connection request accepted', connection: conn });
    } else {
      // Reject simply deletes the request
      await Connection.findByIdAndDelete(connId);
      await Notification.deleteOne({ userId: myId, refId: connId });
      res.json({ message: 'Connection request declined' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to connection request', error: err.message });
  }
});

module.exports = router;
