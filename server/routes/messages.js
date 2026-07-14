const express = require('express');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Fetch conversation list (all users with whom the caller has messages)
router.get('/conversations', auth, async (req, res) => {
  try {
    const me = req.user.id;

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ fromUser: me }, { toUser: me }]
    }).sort({ sentAt: -1 });

    // Collect conversation partner IDs
    const partnerIds = new Set();
    messages.forEach((msg) => {
      const fromStr = msg.fromUser.toString();
      const toStr = msg.toUser.toString();
      if (fromStr !== me) partnerIds.add(fromStr);
      if (toStr !== me) partnerIds.add(toStr);
    });

    const partnerArray = Array.from(partnerIds);

    // Load partner user details
    const partners = await User.find({ _id: { $in: partnerArray } })
      .select('name department isOnline skills');

    const conversations = [];

    for (const partner of partners) {
      const partnerIdStr = partner._id.toString();

      // Find last message
      const lastMsgObj = messages.find(
        (m) =>
          (m.fromUser.toString() === me && m.toUser.toString() === partnerIdStr) ||
          (m.fromUser.toString() === partnerIdStr && m.toUser.toString() === me)
      );

      // Count unread messages from this partner to me
      const unreadCount = await Message.countDocuments({
        fromUser: partner._id,
        toUser: me,
        isRead: false
      });

      conversations.push({
        id: partner._id,
        name: partner.name,
        department: partner.department,
        isOnline: partner.isOnline,
        skills: partner.skills,
        last_msg: lastMsgObj ? lastMsgObj.body : null,
        last_time: lastMsgObj ? lastMsgObj.sentAt : null,
        unread: unreadCount
      });
    }

    // Sort by last message time descending
    conversations.sort((a, b) => new Date(b.last_time || 0) - new Date(a.last_time || 0));

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve conversations', error: err.message });
  }
});

// Fetch chat thread history with user :withId (marks messages as read)
router.get('/thread/:withId', auth, async (req, res) => {
  try {
    const me = req.user.id;
    const withId = req.params.withId;

    // Verify chat partner exists
    const partner = await User.findById(withId).select('name department isOnline skills');
    if (!partner) return res.status(404).json({ message: 'Chat user not found' });

    // Mark messages from partner to me as read
    await Message.updateMany(
      { fromUser: withId, toUser: me, isRead: false },
      { isRead: true }
    );

    // Fetch thread
    const thread = await Message.find({
      $or: [
        { fromUser: me, toUser: withId },
        { fromUser: withId, toUser: me }
      ]
    }).sort({ sentAt: 1 }).limit(100);

    res.json({
      partner,
      thread
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch message thread', error: err.message });
  }
});

// Send Message (requires connection accepted status)
router.post('/', auth, async (req, res) => {
  try {
    const me = req.user.id;
    const { toUser, body } = req.body;

    if (!toUser || !body || body.trim() === '') {
      return res.status(400).json({ message: 'Recipient and message body are required' });
    }

    if (me === toUser) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Check connection status
    const connected = await Connection.findOne({
      $or: [
        { fromUser: me, toUser },
        { fromUser: toUser, toUser: me }
      ],
      status: 'accepted'
    });

    if (!connected) {
      return res.status(403).json({ message: 'You must be connected to exchange messages' });
    }

    const message = await Message.create({
      fromUser: me,
      toUser,
      body: body.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

module.exports = router;
