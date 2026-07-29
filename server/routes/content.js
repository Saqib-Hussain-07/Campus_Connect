const express = require('express');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const EventRsvp = require('../models/EventRsvp');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendError } = require('../utils/apiResponse');
const { projectRules } = require('../middleware/validators');

const router = express.Router();

// ── Projects ──────────────────────────────────────────────────

// Get Projects (with search/filter and pagination)
router.get('/projects', asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 12 } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { techStack: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('userId', 'name department university avatar');

  return sendPaginated(res, projects, pageNum, limitNum, total, 'Projects retrieved successfully');
}));

// Get Single Project by ID
router.get('/projects/:id', asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
    .populate('userId', 'name department university email avatar')
    .populate('comments.userId', 'name department avatar')
    .populate('requests.userId', 'name department skills university avatar');

  if (!project) return sendError(res, 'Project not found', 404);

  project.views = (project.views || 0) + 1;
  await project.save();

  return sendSuccess(res, project, 'Project details fetched successfully');
}));

// Create Project
router.post('/projects', auth, projectRules, asyncHandler(async (req, res) => {
  const { title, description, techStack, githubUrl, liveUrl, category, status, teamSize } = req.body;
  const userId = req.user.id;

  const project = await Project.create({
    userId,
    title,
    description,
    techStack: Array.isArray(techStack)
      ? techStack
      : techStack
      ? techStack.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    githubUrl,
    liveUrl,
    category: category || 'other',
    status: status || 'in_progress',
    teamSize: teamSize ? Number(teamSize) : 1
  });

  await Activity.create({
    userId,
    type: 'project_added',
    refId: project._id,
    refTitle: project.title
  });

  return sendSuccess(res, project, 'Project created successfully', 201);
}));

// Toggle Project Like
router.post('/projects/:id/like', auth, asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  const userId = req.user.id;
  const me = await User.findById(userId);
  const existingIdx = project.likes.indexOf(userId);

  if (existingIdx > -1) {
    project.likes.splice(existingIdx, 1);
    await project.save();
    return sendSuccess(res, { likesCount: project.likes.length, isLiked: false }, 'Project unliked');
  } else {
    project.likes.push(userId);
    await project.save();

    if (project.userId.toString() !== userId) {
      await Notification.create({
        userId: project.userId,
        actorId: userId,
        type: 'project_like',
        refId: project._id,
        message: `${me.name} liked your project "${project.title}"`
      });
    }

    return sendSuccess(res, { likesCount: project.likes.length, isLiked: true }, 'Project liked');
  }
}));

// Comment on Project
router.post('/projects/:id/comment', auth, asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || body.trim() === '') return sendError(res, 'Comment body is required', 400);

  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  const userId = req.user.id;
  project.comments.push({ userId, body: body.trim() });
  await project.save();

  const me = await User.findById(userId);

  if (project.userId.toString() !== userId) {
    await Notification.create({
      userId: project.userId,
      actorId: userId,
      type: 'project_comment',
      refId: project._id,
      message: `${me.name} commented on your project "${project.title}"`
    });
  }

  const updatedProject = await Project.findById(project._id).populate('comments.userId', 'name department avatar');
  return sendSuccess(res, updatedProject.comments, 'Comment posted successfully');
}));

// Submit Join/Team Request for Project
router.post('/projects/:id/request', auth, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  const userId = req.user.id;
  const existing = project.requests.find((r) => r.userId.toString() === userId);
  if (existing) return sendError(res, 'Request already submitted', 400);

  project.requests.push({ userId, message });
  await project.save();

  const me = await User.findById(userId);

  await Notification.create({
    userId: project.userId,
    actorId: userId,
    type: 'project_join_request',
    refId: project._id,
    message: `${me.name} requested to join your project "${project.title}"`
  });

  return sendSuccess(res, { requests: project.requests }, 'Team join request submitted successfully');
}));

// Accept/Reject Team Join Request
router.post('/projects/:id/request/:reqId', auth, asyncHandler(async (req, res) => {
  const { action } = req.body;
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  if (project.userId.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized to moderate requests for this project', 403);
  }

  const subReq = project.requests.id(req.params.reqId);
  if (!subReq) return sendError(res, 'Request not found', 404);

  subReq.status = action === 'accept' ? 'accepted' : 'rejected';
  await project.save();

  const me = await User.findById(req.user.id);
  await Notification.create({
    userId: subReq.userId,
    actorId: req.user.id,
    type: 'project_comment',
    refId: project._id,
    message: `${me.name} ${action}ed your request to join "${project.title}"`
  });

  return sendSuccess(res, { requests: project.requests }, `Request successfully ${action}ed`);
}));

// ── Groups ────────────────────────────────────────────────────

// Get Groups (with filtering and pagination)
router.get('/groups', asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 12 } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (type) query.type = type;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const total = await Group.countDocuments(query);
  const groups = await Group.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('createdBy', 'name department avatar');

  return sendPaginated(res, groups, pageNum, limitNum, total, 'Groups retrieved successfully');
}));

// Create Group
router.post('/groups', auth, asyncHandler(async (req, res) => {
  const { name, description, type, status } = req.body;
  if (!name || name.trim() === '') return sendError(res, 'Group name is required', 400);

  const userId = req.user.id;

  const group = await Group.create({
    name: name.trim(),
    description,
    type: type || 'study',
    status: status || 'active',
    createdBy: userId,
    members: [userId]
  });

  await Activity.create({
    userId,
    type: 'joined_group',
    refId: group._id,
    refTitle: group.name
  });

  return sendSuccess(res, group, 'Group created successfully', 201);
}));

// Join/Leave Study Group
router.post('/groups/:id/join', auth, asyncHandler(async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!group) return sendError(res, 'Group not found', 404);

  const userId = req.user.id;
  const idx = group.members.indexOf(userId);

  if (idx > -1) {
    group.members.splice(idx, 1);
    await group.save();
    return sendSuccess(res, { members: group.members, isMember: false }, 'Left study group successfully');
  } else {
    group.members.push(userId);
    await group.save();

    await Activity.create({
      userId,
      type: 'joined_group',
      refId: group._id,
      refTitle: group.name
    });

    return sendSuccess(res, { members: group.members, isMember: true }, 'Joined study group successfully');
  }
}));

// ── Events ────────────────────────────────────────────────────

// Get Events (with filtering, pagination, and EventRsvp collection query)
router.get('/events', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ eventDate: 1 })
    .skip(skip)
    .limit(limitNum)
    .populate('userId', 'name department avatar')
    .lean();

  // Populate RSVPs from EventRsvp collection for each event
  const eventIds = events.map((e) => e._id);
  const rsvps = await EventRsvp.find({ eventId: { $in: eventIds } });

  const rsvpMap = {};
  rsvps.forEach((r) => {
    const eid = r.eventId.toString();
    if (!rsvpMap[eid]) rsvpMap[eid] = [];
    rsvpMap[eid].push({ userId: r.userId, status: r.status, rsvpedAt: r.createdAt });
  });

  const formattedEvents = events.map((e) => ({
    ...e,
    rsvps: rsvpMap[e._id.toString()] || []
  }));

  return sendPaginated(res, formattedEvents, pageNum, limitNum, total, 'Events retrieved successfully');
}));

// Create Event
router.post('/events', auth, asyncHandler(async (req, res) => {
  const { title, description, category, venue, eventDate, registrationDeadline, maxAttendees, isOnline, bannerSeed } = req.body;
  if (!title || !eventDate) return sendError(res, 'Title and event date are required', 400);

  const userId = req.user.id;

  const event = await Event.create({
    userId,
    title,
    description,
    category: category || 'other',
    venue,
    eventDate: new Date(eventDate),
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
    maxAttendees: maxAttendees ? Number(maxAttendees) : 0,
    isOnline: Boolean(isOnline),
    bannerSeed: bannerSeed || 'ev' + Math.floor(Math.random() * 6 + 1)
  });

  await Activity.create({
    userId,
    type: 'event_created',
    refId: event._id,
    refTitle: event.title
  });

  return sendSuccess(res, { ...event.toObject(), rsvps: [] }, 'Event created successfully', 201);
}));

// RSVP to Event (using EventRsvp collection)
router.post('/events/:id/rsvp', auth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['going', 'interested', 'not_going'].includes(status)) {
    return sendError(res, 'Invalid RSVP status', 400);
  }

  const event = await Event.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!event) return sendError(res, 'Event not found', 404);

  const userId = req.user.id;

  if (status === 'not_going') {
    await EventRsvp.deleteOne({ eventId: event._id, userId });
  } else {
    await EventRsvp.findOneAndUpdate(
      { eventId: event._id, userId },
      { status },
      { upsert: true, new: true }
    );
  }

  const allRsvps = await EventRsvp.find({ eventId: event._id });
  const formattedRsvps = allRsvps.map((r) => ({
    userId: r.userId,
    status: r.status,
    rsvpedAt: r.createdAt
  }));

  return sendSuccess(res, { rsvps: formattedRsvps }, 'RSVP updated successfully');
}));

module.exports = router;