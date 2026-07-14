const express = require('express');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

// ── Projects ──────────────────────────────────────────────────

// Get Projects (with search/filter)
router.get('/projects', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

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

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(24)
      .populate('userId', 'name department university');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load projects', error: err.message });
  }
});

// Get Single Project by ID (with full details, comments, and requests)
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'name department university email')
      .populate('comments.userId', 'name department avatar')
      .populate('requests.userId', 'name department skills university');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Increment views
    project.views = (project.views || 0) + 1;
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project details', error: err.message });
  }
});

// Create Project
router.post('/projects', auth, async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, category, status, teamSize } = req.body;
    const userId = req.user.id;

    const project = await Project.create({
      userId,
      title,
      description,
      techStack: techStack ? techStack.split(',').map((s) => s.trim()).filter(Boolean) : [],
      githubUrl,
      liveUrl,
      category: category || 'other',
      status: status || 'in_progress',
      teamSize: teamSize ? Number(teamSize) : 1
    });

    // Activity log
    await Activity.create({
      userId,
      type: 'project_added',
      refId: project._id,
      refTitle: project.title
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
});

// Toggle Project Like
router.post('/projects/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.id;
    const me = await User.findById(userId);
    const existingIdx = project.likes.indexOf(userId);

    if (existingIdx > -1) {
      project.likes.splice(existingIdx, 1);
      await project.save();
      res.json({ message: 'Project unliked', likesCount: project.likes.length, isLiked: false });
    } else {
      project.likes.push(userId);
      await project.save();

      // Create Notification if it is not my own project
      if (project.userId.toString() !== userId) {
        await Notification.create({
          userId: project.userId,
          actorId: userId,
          type: 'project_like',
          refId: project._id,
          message: `${me.name} liked your project "${project.title}"`
        });
      }

      res.json({ message: 'Project liked', likesCount: project.likes.length, isLiked: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update like status', error: err.message });
  }
});

// Comment on Project
router.post('/projects/:id/comment', auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Comment body is required' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.id;
    project.comments.push({ userId, body });
    await project.save();

    const me = await User.findById(userId);

    // Create Notification if not commenting on own project
    if (project.userId.toString() !== userId) {
      await Notification.create({
        userId: project.userId,
        actorId: userId,
        type: 'project_comment',
        refId: project._id,
        message: `${me.name} commented on your project "${project.title}"`
      });
    }

    // Return updated comment populated
    const updatedProject = await Project.findById(project._id).populate('comments.userId', 'name department avatar');
    res.json(updatedProject.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment', error: err.message });
  }
});

// Submit Join/Team Request for Project
router.post('/projects/:id/request', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user.id;

    // Check if already requested
    const existing = project.requests.find((r) => r.userId.toString() === userId);
    if (existing) return res.status(400).json({ message: 'Request already submitted' });

    project.requests.push({ userId, message });
    await project.save();

    const me = await User.findById(userId);

    // Notify project owner
    await Notification.create({
      userId: project.userId,
      actorId: userId,
      type: 'project_join_request',
      refId: project._id,
      message: `${me.name} requested to join your project "${project.title}"`
    });

    res.json({ message: 'Team join request submitted successfully', requests: project.requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit team request', error: err.message });
  }
});

// Accept/Reject Team Join Request
router.post('/projects/:id/request/:reqId', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only project owner can moderate requests
    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to moderate requests for this project' });
    }

    const subReq = project.requests.id(req.params.reqId);
    if (!subReq) return res.status(404).json({ message: 'Request not found' });

    if (action === 'accept') {
      subReq.status = 'accepted';
    } else {
      subReq.status = 'rejected';
    }

    await project.save();

    // Notify applicant
    const me = await User.findById(req.user.id);
    await Notification.create({
      userId: subReq.userId,
      actorId: req.user.id,
      type: 'project_comment', // Use project comment or generic type for notification routing
      refId: project._id,
      message: `${me.name} ${action}ed your request to join "${project.title}"`
    });

    res.json({ message: `Request successfully ${action}ed`, requests: project.requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to moderate request', error: err.message });
  }
});

// ── Groups ────────────────────────────────────────────────────

// Get Groups (with filtering)
router.get('/groups', async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .limit(24)
      .populate('createdBy', 'name department');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load groups', error: err.message });
  }
});

// Create Group
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, description, type, status } = req.body;
    const userId = req.user.id;

    const group = await Group.create({
      name,
      description,
      type: type || 'study',
      status: status || 'active',
      createdBy: userId,
      members: [userId] // Creator is default first member
    });

    // Log Activity
    await Activity.create({
      userId,
      type: 'joined_group',
      refId: group._id,
      refTitle: group.name
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
});

// Join/Leave Study Group
router.post('/groups/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user.id;
    const idx = group.members.indexOf(userId);

    if (idx > -1) {
      // Leave
      group.members.splice(idx, 1);
      await group.save();
      res.json({ message: 'Left study group successfully', members: group.members, isMember: false });
    } else {
      // Join
      group.members.push(userId);
      await group.save();

      // Activity
      await Activity.create({
        userId,
        type: 'joined_group',
        refId: group._id,
        refTitle: group.name
      });

      res.json({ message: 'Joined study group successfully', members: group.members, isMember: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update group membership', error: err.message });
  }
});

// ── Events ────────────────────────────────────────────────────

// Get Events
router.get('/events', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .sort({ eventDate: 1 })
      .limit(24)
      .populate('userId', 'name department');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load events', error: err.message });
  }
});

// Create Event
router.post('/events', auth, async (req, res) => {
  try {
    const { title, description, category, venue, eventDate, registrationDeadline, maxAttendees, isOnline, bannerSeed } = req.body;
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

    // Activity
    await Activity.create({
      userId,
      type: 'event_created',
      refId: event._id,
      refTitle: event.title
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
});

// RSVP to Event
router.post('/events/:id/rsvp', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'going', 'interested', 'not_going'
    if (!['going', 'interested', 'not_going'].includes(status)) {
      return res.status(400).json({ message: 'Invalid RSVP status' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user.id;
    const rsvpIdx = event.rsvps.findIndex((r) => r.userId.toString() === userId);

    if (rsvpIdx > -1) {
      if (status === 'not_going') {
        event.rsvps.splice(rsvpIdx, 1);
      } else {
        event.rsvps[rsvpIdx].status = status;
        event.rsvps[rsvpIdx].rsvpedAt = new Date();
      }
    } else {
      if (status !== 'not_going') {
        event.rsvps.push({ userId, status });
      }
    }

    await event.save();
    res.json({ message: 'RSVP updated successfully', rsvps: event.rsvps });
  } catch (err) {
    res.status(500).json({ message: 'Failed to RSVP to event', error: err.message });
  }
});

module.exports = router;