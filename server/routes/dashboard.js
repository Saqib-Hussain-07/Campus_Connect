const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const Notice = require('../models/Notice');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

// Dashboard Aggregation Engine with Mongo $facet Pipelines
router.get('/', auth, asyncHandler(async (req, res) => {
  const me = req.user.id;
  const meObjectId = new mongoose.Types.ObjectId(me);
  const now = new Date();

  // Execute aggregated domain pipelines concurrently
  const [
    userObj,
    connectionFacets,
    projectFacets,
    groupFacets,
    messageStats,
    feed,
    stEvents,
    recentNotices
  ] = await Promise.all([
    // 1. Current User Profile
    User.findById(meObjectId).select('-password').lean(),

    // 2. Connection Pipeline ($facet for accepted count, pending requests with populated fromUser, and existing connection IDs)
    Connection.aggregate([
      {
        $facet: {
          acceptedCount: [
            {
              $match: {
                $or: [{ fromUser: meObjectId }, { toUser: meObjectId }],
                status: 'accepted'
              }
            },
            { $count: 'count' }
          ],
          pendingRequests: [
            { $match: { toUser: meObjectId, status: 'pending' } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'fromUser',
                foreignField: '_id',
                as: 'fromUser'
              }
            },
            { $unwind: '$fromUser' },
            {
              $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                'fromUser._id': 1,
                'fromUser.name': 1,
                'fromUser.department': 1,
                'fromUser.skills': 1,
                'fromUser.university': 1,
                'fromUser.avatar': 1
              }
            }
          ],
          existingPartners: [
            {
              $match: {
                $or: [{ fromUser: meObjectId }, { toUser: meObjectId }]
              }
            },
            {
              $project: {
                partnerId: {
                  $cond: [{ $eq: ['$fromUser', meObjectId] }, '$toUser', '$fromUser']
                }
              }
            }
          ]
        }
      }
    ]),

    // 3. Project Pipeline ($facet for count, total likes sum, and recent projects list)
    Project.aggregate([
      {
        $facet: {
          stats: [
            { $match: { userId: meObjectId, isDeleted: { $ne: true } } },
            {
              $group: {
                _id: null,
                projectCount: { $sum: 1 },
                totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
              }
            }
          ],
          recentProjects: [
            { $match: { userId: meObjectId, isDeleted: { $ne: true } } },
            { $sort: { createdAt: -1 } },
            { $limit: 4 },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                category: 1,
                status: 1,
                techStack: 1,
                likes: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]),

    // 4. Group Pipeline ($facet for count and recent joined groups)
    Group.aggregate([
      {
        $facet: {
          groupCount: [
            { $match: { members: meObjectId, isDeleted: { $ne: true } } },
            { $count: 'count' }
          ],
          recentGroups: [
            { $match: { members: meObjectId, isDeleted: { $ne: true } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                name: 1,
                type: 1,
                status: 1,
                description: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]),

    // 5. Unread Message Count
    Message.aggregate([
      {
        $match: {
          toUser: meObjectId,
          isRead: false,
          isDeleted: { $ne: true }
        }
      },
      { $count: 'count' }
    ]),

    // 6. Global Real-time Activity Feed with $lookup to Users
    Activity.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          type: 1,
          refId: 1,
          refTitle: 1,
          createdAt: 1,
          'userId._id': 1,
          'userId.name': 1,
          'userId.department': 1,
          'userId.avatar': 1
        }
      }
    ]),

    // 7. Upcoming Events
    Event.find({
      eventDate: { $gte: now },
      isDeleted: { $ne: true }
    })
      .sort({ eventDate: 1 })
      .limit(3)
      .select('title category eventDate venue isOnline bannerSeed')
      .lean(),

    // 8. Recent Notice Board items
    Notice.find({
      isDeleted: { $ne: true },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3)
      .select('title category isPinned createdAt')
      .lean()
  ]);

  // Unpack Connection Facet Results
  const connData = connectionFacets[0] || {};
  const connCount = connData.acceptedCount?.[0]?.count || 0;
  const requests = connData.pendingRequests || [];
  const existingPartnerIds = (connData.existingPartners || []).map((p) => p.partnerId);

  // Unpack Project Facet Results
  const projData = projectFacets[0] || {};
  const projStats = projData.stats?.[0] || { projectCount: 0, totalLikes: 0 };
  const myProjects = projData.recentProjects || [];

  // Unpack Group Facet Results
  const grpData = groupFacets[0] || {};
  const grpCount = grpData.groupCount?.[0]?.count || 0;
  const myGroupsData = grpData.recentGroups || [];

  // Unpack Message Stats
  const unreadCount = messageStats[0]?.count || 0;

  // Suggested peers: find un-connected active students
  const excludeUserIds = [meObjectId, ...existingPartnerIds];
  const suggestions = await User.find({
    _id: { $nin: excludeUserIds },
    isDeleted: { $ne: true }
  })
    .select('name department skills university isOnline avatar')
    .sort({ isOnline: -1, name: 1 })
    .limit(4)
    .lean();

  return sendSuccess(
    res,
    {
      user: userObj,
      stats: {
        connCount,
        grpCount,
        myProjectCount: projStats.projectCount,
        myLikesTotal: projStats.totalLikes,
        myEndorseCount: userObj ? (userObj.endorsements || []).length : 0,
        pendingCount: requests.length,
        unreadCount
      },
      requests,
      myGroupsData,
      myProjects,
      feed,
      suggestions,
      stEvents,
      recentNotices
    },
    'Dashboard data retrieved successfully'
  );
}));

module.exports = router;
