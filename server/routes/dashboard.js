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

router.get('/', auth, asyncHandler(async (req, res) => {
  const me = req.user.id;
  const meObjectId = new mongoose.Types.ObjectId(me);

  // Parallel database calls
  const [
    connCount,
    grpCount,
    myProjectCount,
    likesAggregation,
    currentUserObj,
    pendingCount,
    unreadCount,
    requests,
    myGroupsData,
    myProjects,
    feed,
    existingConns,
    stEvents,
    recentNotices
  ] = await Promise.all([
    Connection.countDocuments({
      $or: [{ fromUser: me }, { toUser: me }],
      status: 'accepted'
    }),
    Group.countDocuments({ members: me, isDeleted: { $ne: true } }),
    Project.countDocuments({ userId: me, isDeleted: { $ne: true } }),
    
    // Aggregation pipeline for computing total project likes
    Project.aggregate([
      { $match: { userId: meObjectId, isDeleted: { $ne: true } } },
      { $project: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
    ]),

    User.findById(me).select('-password'),
    Connection.countDocuments({ toUser: me, status: 'pending' }),
    Message.countDocuments({ toUser: me, isRead: false, isDeleted: { $ne: true } }),
    
    Connection.find({ toUser: me, status: 'pending' })
      .populate('fromUser', 'name department skills university avatar')
      .sort({ createdAt: -1 })
      .limit(5),

    Group.find({ members: me, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5),

    Project.find({ userId: me, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(4),

    Activity.find()
      .populate('userId', 'name department avatar')
      .sort({ createdAt: -1 })
      .limit(10),

    Connection.find({
      $or: [{ fromUser: me }, { toUser: me }]
    }),

    Event.find({
      rsvps: {
        $elemMatch: { userId: me, status: 'going' }
      },
      eventDate: { $gte: new Date() },
      isDeleted: { $ne: true }
    })
      .sort({ eventDate: 1 })
      .limit(3),

    Notice.find({
      isDeleted: { $ne: true },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3)
  ]);

  const myLikesTotal = likesAggregation[0] ? likesAggregation[0].totalLikes : 0;
  const myEndorseCount = currentUserObj ? (currentUserObj.endorsements || []).length : 0;

  const connectedUserIds = [me];
  existingConns.forEach((c) => {
    connectedUserIds.push(c.fromUser.toString());
    connectedUserIds.push(c.toUser.toString());
  });

  const suggestions = await User.find({
    _id: { $not: { $in: connectedUserIds } },
    isDeleted: { $ne: true }
  })
    .select('name department skills university isOnline avatar')
    .sort({ isOnline: -1, name: 1 })
    .limit(4);

  return sendSuccess(res, {
    user: currentUserObj,
    stats: {
      connCount,
      grpCount,
      myProjectCount,
      myLikesTotal,
      myEndorseCount,
      pendingCount,
      unreadCount
    },
    requests,
    myGroupsData,
    myProjects,
    feed,
    suggestions,
    stEvents,
    recentNotices
  }, 'Dashboard data retrieved successfully');
}));

module.exports = router;
