const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO with JWT authentication, Redis cluster adapter support, and presence rooms
 */
const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Optional Redis Adapter for horizontal scaling across multiple instances
  if (process.env.REDIS_URL) {
    try {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const Redis = require('ioredis');
      const pubClient = new Redis(process.env.REDIS_URL);
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO: Redis adapter attached for horizontal scaling.');
    } catch (redisErr) {
      logger.warn('Socket.IO: Redis adapter connection failed, using in-memory adapter.', redisErr.message);
    }
  }

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name department avatar isOnline').lean();
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    const userRoom = `user_${userId}`;
    socket.join(userRoom);

    logger.info(`Socket: User connected -> ${socket.user.name} (${userId}) on socket ${socket.id}`);

    // Update user online status in database
    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('user_status_change', { userId, isOnline: true });

    // Join specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
      }
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Handle Real-time Message Send
    socket.on('send_message', async (data, callback) => {
      try {
        const { toUserId, body, conversationId, tempId } = data;
        const trimmedBody = (body || '').trim();

        if (!toUserId || !trimmedBody) {
          if (callback) callback({ success: false, error: 'Invalid message payload' });
          return;
        }

        // Find or create active conversation
        let conversation = null;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        }
        if (!conversation) {
          conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [userId, toUserId] }
          });
        }
        if (!conversation) {
          conversation = await Conversation.create({
            type: 'direct',
            participants: [userId, toUserId],
            lastMessageText: trimmedBody,
            lastMessageAt: new Date()
          });
        }

        // Create and persist message
        const newMsg = await Message.create({
          conversationId: conversation._id,
          fromUser: userId,
          toUser: toUserId,
          body: trimmedBody,
          status: 'sent',
          isRead: false
        });

        // Update conversation pointer
        conversation.lastMessage = newMsg._id;
        conversation.lastMessageText = trimmedBody;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('fromUser', 'name department avatar isOnline')
          .populate('toUser', 'name department avatar isOnline')
          .lean();

        // Emit to recipient's private room
        io.to(`user_${toUserId}`).emit('new_message', {
          message: populatedMsg,
          conversationId: conversation._id,
          tempId
        });

        // Emit back to sender confirmation
        socket.emit('message_sent', {
          message: populatedMsg,
          conversationId: conversation._id,
          tempId
        });

        if (callback) callback({ success: true, message: populatedMsg, tempId });
      } catch (err) {
        logger.error('Socket send_message error:', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Real-time Typing Indicators
    socket.on('typing_start', ({ toUserId, conversationId }) => {
      if (toUserId) {
        io.to(`user_${toUserId}`).emit('user_typing', {
          userId,
          name: socket.user.name,
          conversationId,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', ({ toUserId, conversationId }) => {
      if (toUserId) {
        io.to(`user_${toUserId}`).emit('user_typing', {
          userId,
          name: socket.user.name,
          conversationId,
          isTyping: false
        });
      }
    });

    // Real-time Read Receipts
    socket.on('mark_read', async ({ conversationId, partnerId }) => {
      try {
        if (conversationId || partnerId) {
          const query = conversationId
            ? { conversationId, fromUser: partnerId, isRead: false }
            : { fromUser: partnerId, toUser: userId, isRead: false };

          await Message.updateMany(query, { isRead: true, status: 'read' });

          if (partnerId) {
            io.to(`user_${partnerId}`).emit('messages_read', {
              byUserId: userId,
              conversationId
            });
          }
        }
      } catch (err) {
        logger.error('Socket mark_read error:', err.message);
      }
    });

    // Disconnect & Presence Management
    socket.on('disconnect', async () => {
      logger.info(`Socket: User disconnected -> ${socket.user.name} (${userId})`);
      const remainingSockets = await io.in(userRoom).fetchSockets();
      if (remainingSockets.length === 0) {
        await User.findByIdAndUpdate(userId, { isOnline: false });
        socket.broadcast.emit('user_status_change', { userId, isOnline: false });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
