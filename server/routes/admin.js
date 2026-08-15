const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Event = require('../models/Event');
const EventRsvp = require('../models/EventRsvp');
const Group = require('../models/Group');
const Resource = require('../models/Resource');
const Message = require('../models/Message');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Restrict all routes in this file to authenticated admins
router.use(auth, requireAdmin);

/**
 * @route   GET /api/admin/analytics
 * @desc    Comprehensive Campus Analytics & Metrics Aggregation
 * @access  Private (Admin only)
 */
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers7d,
      newUsers30d,
      bannedUsers,
      totalProjects,
      totalEvents,
      totalRsvps,
      totalGroups,
      totalResources,
      totalMessages,
      pendingReports
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isDeleted: { $ne: true } }),
      User.countDocuments({ isBanned: true }),
      Project.countDocuments(),
      Event.countDocuments(),
      EventRsvp.countDocuments({ status: { $in: ['going', 'interested'] } }),
      Group.countDocuments(),
      Resource.countDocuments(),
      Message.countDocuments(),
      Report.countDocuments({ status: 'pending' })
    ]);

    // Registration trend by day (last 7 days)
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Projects by category breakdown
    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return sendSuccess(res, {
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          new7d: newUsers7d,
          new30d: newUsers30d,
          banned: bannedUsers
        },
        engagement: {
          projects: totalProjects,
          events: totalEvents,
          rsvps: totalRsvps,
          groups: totalGroups,
          resources: totalResources,
          messages: totalMessages
        },
        moderation: {
          pendingReports
        }
      },
      trends: {
        registrations: registrationTrend,
        projectsByCategory
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics: ' + error.message, 500, 'ANALYTICS_ERROR');
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Search and paginate all users
 * @access  Private (Admin only)
 */
router.get('/users', async (req, res) => {
  try {
    const { q = '', role, isBanned, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const query = { isDeleted: { $ne: true } };

    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }];
    }

    if (role) query.role = role;
    if (isBanned !== undefined && isBanned !== '') query.isBanned = isBanned === 'true';

    const [users, total] = await Promise.all([
      User.find(query)
        .select('_id name email role department isOnline isBanned bannedReason bannedAt createdAt')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    return sendSuccess(res, {
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to list users: ' + error.message, 500, 'USER_LIST_ERROR');
  }
});

/**
 * @route   POST /api/admin/users/:id/ban
 * @desc    Ban or unban a user
 * @access  Private (Admin only)
 */
router.post('/users/:id/ban', async (req, res) => {
  try {
    const { ban, reason } = req.body;
    const isBanning = ban !== false;

    if (req.params.id === req.user.id) {
      return sendError(res, 'Admins cannot ban themselves', 400, 'CANNOT_BAN_SELF');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: isBanning,
        bannedReason: isBanning ? (reason || 'Violated campus community guidelines').trim() : null,
        bannedAt: isBanning ? new Date() : null
      },
      { new: true }
    ).select('_id name email role isBanned bannedReason bannedAt');

    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, user, isBanning ? `User ${user.name} has been banned` : `User ${user.name} has been unbanned`);
  } catch (error) {
    return sendError(res, 'Failed to update user ban status: ' + error.message, 500, 'BAN_ERROR');
  }
});

/**
 * @route   DELETE /api/admin/content/:type/:id
 * @desc    Remove inappropriate content by admin
 * @access  Private (Admin only)
 */
router.delete('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    let deleted = null;
    switch (type.toLowerCase()) {
      case 'project':
        deleted = await Project.findByIdAndDelete(id);
        break;
      case 'event':
        deleted = await Event.findByIdAndDelete(id);
        break;
      case 'group':
        deleted = await Group.findByIdAndDelete(id);
        break;
      case 'resource':
        deleted = await Resource.findByIdAndDelete(id);
        break;
      default:
        return sendError(res, 'Invalid content type', 400, 'INVALID_TYPE');
    }

    if (!deleted) {
      return sendError(res, 'Content item not found', 404, 'NOT_FOUND');
    }

    // Auto-resolve any pending reports on this target
    await Report.updateMany(
      { targetType: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(), targetId: id, status: 'pending' },
      { status: 'resolved', resolutionNotes: 'Content removed by administrator', resolvedBy: req.user.id, resolvedAt: new Date() }
    );

    return sendSuccess(res, { id, type }, `Inappropriate ${type} successfully removed`);
  } catch (error) {
    return sendError(res, 'Failed to remove content: ' + error.message, 500, 'CONTENT_DELETE_ERROR');
  }
});

module.exports = router;
