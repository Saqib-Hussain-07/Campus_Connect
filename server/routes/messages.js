const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { messageRules } = require('../validators/message.validator');

const router = express.Router();

// Helper to get or create a 1-to-1 conversation
const getOrCreateConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userA, userB], $size: 2 }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
      type: 'direct'
    });
  }

  return conversation;
};

// Fetch conversation list using Conversation model
router.get('/conversations', auth, asyncHandler(async (req, res) => {
  const me = req.user.id;

  // Find all conversations where caller is a participant
  const dbConversations = await Conversation.find({ participants: me })
    .populate('participants', 'name department isOnline skills avatar')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .lean();

  const conversations = await Promise.all(
    dbConversations.map(async (conv) => {
      const partner = conv.participants.find((p) => p._id.toString() !== me);
      if (!partner) return null;

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        fromUser: partner._id,
        isRead: false
      });

      return {
        conversationId: conv._id,
        id: partner._id,
        name: partner.name,
        department: partner.department,
        isOnline: partner.isOnline,
        skills: partner.skills,
        avatar: partner.avatar,
        last_msg: conv.lastMessageText || (conv.lastMessage ? conv.lastMessage.body : null),
        last_time: conv.lastMessageAt || (conv.lastMessage ? conv.lastMessage.createdAt : null),
        unread: unreadCount
      };
    })
  );

  const filteredConversations = conversations.filter(Boolean);

  // Fallback for legacy messages that might not have a conversation model yet
  if (filteredConversations.length === 0) {
    const messages = await Message.find({
      $or: [{ fromUser: me }, { toUser: me }]
    }).sort({ createdAt: -1 }).lean();

    const partnerIds = new Set();
    messages.forEach((msg) => {
      const fromStr = msg.fromUser.toString();
      const toStr = msg.toUser.toString();
      if (fromStr !== me) partnerIds.add(fromStr);
      if (toStr !== me) partnerIds.add(toStr);
    });

    const partners = await User.find({ _id: { $in: Array.from(partnerIds) } })
      .select('name department isOnline skills avatar')
      .lean();

    for (const partner of partners) {
      const partnerIdStr = partner._id.toString();
      const lastMsgObj = messages.find(
        (m) =>
          (m.fromUser.toString() === me && m.toUser.toString() === partnerIdStr) ||
          (m.fromUser.toString() === partnerIdStr && m.toUser.toString() === me)
      );

      const unreadCount = await Message.countDocuments({
        fromUser: partner._id,
        toUser: me,
        isRead: false
      });

      filteredConversations.push({
        id: partner._id,
        name: partner.name,
        department: partner.department,
        isOnline: partner.isOnline,
        skills: partner.skills,
        avatar: partner.avatar,
        last_msg: lastMsgObj ? lastMsgObj.body : null,
        last_time: lastMsgObj ? lastMsgObj.createdAt : null,
        unread: unreadCount
      });
    }

    filteredConversations.sort((a, b) => new Date(b.last_time || 0) - new Date(a.last_time || 0));
  }

  return sendSuccess(res, filteredConversations, 'Conversations retrieved successfully');
}));

// Fetch chat thread history
router.get('/thread/:withId', auth, asyncHandler(async (req, res) => {
  const me = req.user.id;
  const withId = req.params.withId;
  const { page = 1, limit = 50 } = req.query;

  const partner = await User.findById(withId).select('name department isOnline skills avatar').lean();
  if (!partner) return sendError(res, 'Chat user not found', 404);

  const conversation = await getOrCreateConversation(me, withId);

  // Mark unread messages from partner as read
  await Message.updateMany(
    {
      $or: [
        { conversationId: conversation._id, fromUser: withId },
        { fromUser: withId, toUser: me }
      ],
      isRead: false
    },
    { isRead: true, status: 'read' }
  );

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const thread = await Message.find({
    $or: [
      { conversationId: conversation._id },
      { fromUser: me, toUser: withId },
      { fromUser: withId, toUser: me }
    ]
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limitNum)
    .populate('replyTo', 'body fromUser')
    .lean();

  return sendSuccess(res, { conversationId: conversation._id, partner, thread }, 'Message thread retrieved successfully');
}));

// Send Message (with Conversation tracking, attachments & status)
router.post('/', auth, messageRules, asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { toUser, content, body, attachments, replyTo } = req.body;
  const messageBody = (content || body || '').trim();

  if (me === toUser) {
    return sendError(res, 'Cannot message yourself', 400);
  }

  const connected = await Connection.findOne({
    $or: [
      { fromUser: me, toUser },
      { fromUser: toUser, toUser: me }
    ],
    status: 'accepted'
  });

  if (!connected) {
    return sendError(res, 'You must be connected to exchange messages', 403);
  }

  const conversation = await getOrCreateConversation(me, toUser);

  const message = await Message.create({
    conversationId: conversation._id,
    fromUser: me,
    toUser,
    body: messageBody,
    status: 'sent',
    isRead: false,
    attachments: Array.isArray(attachments) ? attachments : [],
    replyTo: replyTo || undefined
  });

  // Update conversation last message details
  conversation.lastMessage = message._id;
  conversation.lastMessageText = messageBody;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return sendSuccess(res, message, 'Message sent successfully', 201);
}));

module.exports = router;
