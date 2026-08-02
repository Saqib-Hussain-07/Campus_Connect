const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { buildSafeRegexQuery } = require('../utils/regex');

const router = express.Router();

// Get users list (with safe query filters: search, department, university, skill, and pagination)
router.get('/', asyncHandler(async (req, res) => {
  const { search, department, university, semester, skill, page = 1, limit = 12 } = req.query;
  const query = {};

  if (search) {
    const safeRegex = buildSafeRegexQuery(search);
    if (safeRegex) query.name = safeRegex;
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
    const safeSkillRegex = buildSafeRegexQuery(skill);
    if (safeSkillRegex) query.skills = safeSkillRegex;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  query.isDeleted = { $ne: true };

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('-password')
      .sort({ isOnline: -1, name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
  ]);

  return sendPaginated(res, users, pageNum, limitNum, total, 'Users retrieved successfully');
}));

// Upload Avatar Photo
router.put('/avatar', auth, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Please upload an image file', 400);
  }

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 'User not found', 404);

  const oldAvatar = user.avatar;
  user.avatar = req.file.filename;
  await user.save();

  // Delete old avatar file from disk if it was a custom file
  if (oldAvatar && oldAvatar !== 'default.jpg' && oldAvatar !== req.file.filename) {
    const oldPath = path.join(__dirname, '../assets/uploads/avatars', oldAvatar);
    fs.unlink(oldPath, () => {});
  }

  return sendSuccess(
    res,
    { avatar: user.avatar },
    'Avatar photo uploaded successfully'
  );
}));

// Update Profile
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { name, department, semester, university, skills, bio, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 'User not found', 404);

  if (name) user.name = name;
  if (department !== undefined) user.department = department;
  if (semester !== undefined) user.semester = semester ? Number(semester) : undefined;
  if (university !== undefined) user.university = university;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills.map((s) => s.trim()).filter(Boolean)
      : typeof skills === 'string' && skills
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  }

  await user.save();
  return sendSuccess(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      semester: user.semester,
      university: user.university,
      skills: user.skills,
      bio: user.bio,
      avatar: user.avatar
    },
    'Profile updated successfully'
  );
}));

// Check connection status with a user
router.get('/connections/status/:id', auth, asyncHandler(async (req, res) => {
  const myId = req.user.id;
  const theirId = req.params.id;

  const conn = await Connection.findOne({
    $or: [
      { fromUser: myId, toUser: theirId },
      { fromUser: theirId, toUser: myId }
    ]
  }).lean();

  if (!conn) return sendSuccess(res, { status: null }, 'Connection status retrieved');
  return sendSuccess(res, { status: conn.status, connectionId: conn._id, fromUser: conn.fromUser }, 'Connection status retrieved');
}));

// Get user profile details by ID (Parallelized with .lean())
router.get('/:id', asyncHandler(async (req, res) => {
  const [user, groups, projects] = await Promise.all([
    User.findById(req.params.id).select('-password').lean(),
    Group.find({ members: req.params.id, isDeleted: { $ne: true } }).limit(6).select('name type status').lean(),
    Project.find({ userId: req.params.id, isDeleted: { $ne: true } }).sort({ likes: -1 }).limit(4).lean()
  ]);

  if (!user) return sendError(res, 'User not found', 404);

  const endorsementCounts = {};
  (user.skills || []).forEach(skill => {
    endorsementCounts[skill] = 0;
  });
  (user.endorsements || []).forEach(e => {
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

  return sendSuccess(
    res,
    {
      profile: user,
      groups,
      projects,
      endorsements
    },
    'Student details fetched successfully'
  );
}));

// Toggle Skill Endorsement
router.post('/:id/endorse', auth, asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const endorserId = req.user.id;
  const { skill } = req.body;

  if (!skill) return sendError(res, 'Skill is required', 400);
  if (targetUserId === endorserId) return sendError(res, 'Cannot endorse yourself', 400);

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return sendError(res, 'User not found', 404);

  const connected = await Connection.findOne({
    $or: [
      { fromUser: endorserId, toUser: targetUserId },
      { fromUser: targetUserId, toUser: endorserId }
    ],
    status: 'accepted'
  });
  if (!connected) return sendError(res, 'You must be connected to endorse skills', 400);

  const endorser = await User.findById(endorserId);

  const existingIdx = targetUser.endorsements.findIndex(
    (e) => e.skill.toLowerCase() === skill.toLowerCase() && e.endorserId.toString() === endorserId
  );

  if (existingIdx > -1) {
    targetUser.endorsements.splice(existingIdx, 1);
    await targetUser.save();
    return sendSuccess(res, { user: targetUser }, `Unendorsed ${skill}`);
  } else {
    targetUser.endorsements.push({ skill, endorserId });
    await targetUser.save();

    await Notification.create({
      userId: targetUserId,
      actorId: endorserId,
      type: 'endorsement',
      message: `${endorser.name} endorsed you for "${skill}"`
    });

    await Activity.create({
      userId: endorserId,
      type: 'endorsed',
      refId: targetUserId,
      refTitle: targetUser.name
    });

    return sendSuccess(res, { user: targetUser }, `Endorsed ${skill}`);
  }
}));

// Send Connection Request
router.post('/:id/connect', auth, asyncHandler(async (req, res) => {
  const fromUser = req.user.id;
  const toUser = req.params.id;

  if (fromUser === toUser) return sendError(res, 'Cannot connect with yourself', 400);

  const existing = await Connection.findOne({
    $or: [
      { fromUser, toUser },
      { fromUser: toUser, toUser: fromUser }
    ]
  });

  if (existing) {
    return sendError(res, 'Connection already exists or is pending', 400);
  }

  const conn = await Connection.create({ fromUser, toUser, status: 'pending' });
  const me = await User.findById(fromUser);

  await Notification.create({
    userId: toUser,
    actorId: fromUser,
    type: 'connection_request',
    refId: conn._id,
    message: `${me.name} sent you a connection request`
  });

  return sendSuccess(res, { connection: conn }, 'Connection request sent successfully', 201);
}));

// Accept/Reject Connection Request
router.post('/connections/:connId/respond', auth, asyncHandler(async (req, res) => {
  const { action } = req.body;
  const connId = req.params.connId;
  const myId = req.user.id;

  const conn = await Connection.findById(connId);
  if (!conn) return sendError(res, 'Connection request not found', 404);

  if (conn.toUser.toString() !== myId) {
    return sendError(res, 'Unauthorized to respond to this request', 403);
  }

  if (action === 'accept') {
    conn.status = 'accepted';
    await conn.save();

    const sender = await User.findById(conn.fromUser);
    const recipient = await User.findById(myId);

    await Notification.create({
      userId: conn.fromUser,
      actorId: myId,
      type: 'connection_accepted',
      refId: conn._id,
      message: `${recipient.name} accepted your connection request`
    });

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

    await Notification.deleteOne({ userId: myId, refId: conn._id, type: 'connection_request' });

    return sendSuccess(res, { connection: conn }, 'Connection request accepted');
  } else {
    await Connection.findByIdAndDelete(connId);
    await Notification.deleteOne({ userId: myId, refId: connId });
    return sendSuccess(res, null, 'Connection request declined');
  }
}));

module.exports = router;
