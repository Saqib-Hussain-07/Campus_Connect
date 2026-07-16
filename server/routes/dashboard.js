const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const Notice = require('../models/Notice');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const me = req.user.id;

    // 1. Counts
    const connCount = await Connection.countDocuments({
      $or: [{ fromUser: me }, { toUser: me }],
      status: 'accepted'
    });

    const grpCount = await Group.countDocuments({ members: me });
    const myProjectCount = await Project.countDocuments({ userId: me });

    // Sum likes on my projects
    const myProjectsList = await Project.find({ userId: me });
    const myLikesTotal = myProjectsList.reduce((acc, proj) => acc + (proj.likes ? proj.likes.length : 0), 0);

    const currentUserObj = await User.findById(me);
    const myEndorseCount = currentUserObj ? currentUserObj.endorsements.length : 0;

    const pendingCount = await Connection.countDocuments({ toUser: me, status: 'pending' });
    const unreadCount = await Message.countDocuments({ toUser: me, isRead: false });

    // 2. Pending Requests (with fromUser details)
    const requests = await Connection.find({ toUser: me, status: 'pending' })
      .populate('fromUser', 'name department skills university')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. My groups
    const myGroupsData = await Group.find({ members: me })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. My projects
    const myProjects = await Project.find({ userId: me })
      .sort({ createdAt: -1 })
      .limit(4);

    // 5. Activity Feed
    const feed = await Activity.find()
      .populate('userId', 'name department avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // 6. Suggestions (exclude me and any user who is already connected/pending)
    const existingConns = await Connection.find({
      $or: [{ fromUser: me }, { toUser: me }]
    });

    const connectedUserIds = [me];
    existingConns.forEach((c) => {
      connectedUserIds.push(c.fromUser.toString());
      connectedUserIds.push(c.toUser.toString());
    });

    // Select random users prioritized by online status
    const suggestions = await User.find({
      _id: { $not: { $in: connectedUserIds } }
    })
      .select('name department skills university isOnline')
      .sort({ isOnline: -1, name: 1 })
      .limit(4);

    // 7. Upcoming events (RSVP is 'going' and eventDate >= now)
    const stEvents = await Event.find({
      rsvps: {
        $elemMatch: { userId: me, status: 'going' }
      },
      eventDate: { $gte: new Date() }
    })
      .sort({ eventDate: 1 })
      .limit(3);

    // 8. Recent Notices (active)
    const recentNotices = await Notice.find({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3);

    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard stats', error: err.message });
  }
});

module.exports = router;
