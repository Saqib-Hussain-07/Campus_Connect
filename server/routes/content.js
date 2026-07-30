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
const { buildSafeRegexQuery } = require('../utils/regex');

const router = express.Router();

// ── Projects ──────────────────────────────────────────────────

// Get Projects (with safe search/filter and pagination)
router.get('/projects', asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 12 } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (search) {
    const safeRegex = buildSafeRegexQuery(search);
    if (safeRegex) {
      query.$or = [
        { title: safeRegex },
        { techStack: safeRegex },
        { description: safeRegex }
      ];
    }
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

// Edit Project (PUT /projects/:id)
router.put('/projects/:id', auth, asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  if (project.userId.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to edit this project', 403);
  }

  const { title, description, category, techStack, githubUrl, liveUrl, status, teamSize } = req.body;
  if (title) project.title = title.trim();
  if (description) project.description = description.trim();
  if (category) project.category = category;
  if (techStack) project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map(s => s.trim());
  if (githubUrl !== undefined) project.githubUrl = githubUrl;
  if (liveUrl !== undefined) project.liveUrl = liveUrl;
  if (status) project.status = status;
  if (teamSize) project.teamSize = Number(teamSize);

  await project.save();
  return sendSuccess(res, project, 'Project updated successfully');
}));

// Delete Project (DELETE /projects/:id)
router.delete('/projects/:id', auth, asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!project) return sendError(res, 'Project not found', 404);

  if (project.userId.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this project', 403);
  }

  project.isDeleted = true;
  project.deletedAt = new Date();
  await project.save();

  return sendSuccess(res, null, 'Project deleted successfully');
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

// ── Groups ────────────────────────────────────────────────────

// Get Groups (with filtering and pagination)
router.get('/groups', asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 12 } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (type) query.type = type;
  if (search) {
    const safeRegex = buildSafeRegexQuery(search);
    if (safeRegex) {
      query.$or = [
        { name: safeRegex },
        { description: safeRegex }
      ];
    }
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

// Edit Group (PUT /groups/:id)
router.put('/groups/:id', auth, asyncHandler(async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!group) return sendError(res, 'Group not found', 404);

  if (group.createdBy.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to edit this group', 403);
  }

  const { name, description, type, status } = req.body;
  if (name) group.name = name.trim();
  if (description) group.description = description.trim();
  if (type) group.type = type;
  if (status) group.status = status;

  await group.save();
  return sendSuccess(res, group, 'Group updated successfully');
}));

// Delete Group (DELETE /groups/:id)
router.delete('/groups/:id', auth, asyncHandler(async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!group) return sendError(res, 'Group not found', 404);

  if (group.createdBy.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this group', 403);
  }

  group.isDeleted = true;
  group.deletedAt = new Date();
  await group.save();

  return sendSuccess(res, null, 'Group deleted successfully');
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
    const safeRegex = buildSafeRegexQuery(search);
    if (safeRegex) {
      query.$or = [
        { title: safeRegex },
        { description: safeRegex }
      ];
    }
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

// Edit Event (PUT /events/:id)
router.put('/events/:id', auth, asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!event) return sendError(res, 'Event not found', 404);

  if (event.userId.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to edit this event', 403);
  }

  const { title, description, category, eventDate, venue, isOnline } = req.body;
  if (title) event.title = title.trim();
  if (description) event.description = description.trim();
  if (category) event.category = category;
  if (eventDate) event.eventDate = new Date(eventDate);
  if (venue !== undefined) event.venue = venue;
  if (isOnline !== undefined) event.isOnline = Boolean(isOnline);

  await event.save();
  return sendSuccess(res, event, 'Event updated successfully');
}));

// Delete Event (DELETE /events/:id)
router.delete('/events/:id', auth, asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!event) return sendError(res, 'Event not found', 404);

  if (event.userId.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this event', 403);
  }

  event.isDeleted = true;
  event.deletedAt = new Date();
  await event.save();

  return sendSuccess(res, null, 'Event deleted successfully');
}));

// RSVP to Event
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