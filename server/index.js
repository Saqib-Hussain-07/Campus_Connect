const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const { validateEnv } = require('./config/env');
const getCorsOptions = require('./middleware/corsConfig');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { sendSuccess } = require('./utils/apiResponse');
const { cacheMiddleware } = require('./utils/cache');

// Validate environment variables BEFORE app initialization
validateEnv();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const dashboardRoutes = require('./routes/dashboard');
const noticesRoutes = require('./routes/notices');
const resourcesRoutes = require('./routes/resources');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');
const compression = require('compression');
const generalRoutes = require('./routes/general');
const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/reports');
const bookmarkRoutes = require('./routes/bookmarks');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Response Compression (Gzip / Brotli)
app.use(compression());

const cookieParser = require('./middleware/cookieParser');
const helmetConfig = require('./config/helmetConfig');

// Security Middlewares
app.use(helmet(helmetConfig));
app.use(getCorsOptions());
app.use(cookieParser);

// HTTP Request Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body Parsers & Static Files with Browser Caching Headers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/assets/uploads', express.static(path.join(__dirname, '../assets/uploads'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// General API Rate Limiter
app.use('/api', apiLimiter);

// Minimal Health Check Endpoint (Debug endpoint /api/db-debug removed)
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() }, 'CampusConnect API is healthy');
});

const User = require('./models/User');
const Group = require('./models/Group');
const Connection = require('./models/Connection');
const Message = require('./models/Message');

app.get('/api/home', cacheMiddleware(60), async (req, res, next) => {
  try {
    const [userCount, groupCount, connCount, messageCount, recentStudents, recentGroups] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Group.countDocuments({ isDeleted: { $ne: true } }),
      Connection.countDocuments({ status: 'accepted' }),
      Message.countDocuments({ isDeleted: { $ne: true } }),
      User.find({ isDeleted: { $ne: true } }, 'name department semester university skills isOnline avatar')
        .sort({ _id: -1 })
        .limit(6)
        .lean(),
      Group.find({ isDeleted: { $ne: true } })
        .populate('createdBy', 'name')
        .sort({ _id: -1 })
        .limit(6)
        .lean()
    ]);

    return sendSuccess(res, {
      hero: {
        eyebrow: 'Trusted by 50+ Universities',
        title: ['Connect.', 'Collaborate.', 'Grow.'],
        subtitle: 'Join a secure, verified student network to find peers with the right skills, collaborate on real projects, and build academic relationships that matter.'
      },
      stats: [
        { label: 'Students', value: `${userCount}+`, suffix: '+' },
        { label: 'Groups', value: `${groupCount}+`, suffix: '+' },
        { label: 'Universities', value: '50+', suffix: '+' }
      ],
      features: [
        ['01', 'fa-id-card', 'Rich Student Profiles', 'Build a detailed academic identity — your skills, courses, availability, and project interests all in one verified page.'],
        ['02', 'fa-sliders', 'Smart Filtering', 'Search by department, skills, semester, or active courses. Find exactly who you need in under a minute.'],
        ['03', 'fa-comment-dots', 'Direct Messaging', 'Instant 1-on-1 direct messaging with read receipts and active status — communicate directly with campus peers.'],
        ['04', 'fa-users-rectangle', 'Study Groups', 'Create subject-specific groups. Schedule sessions, share notes, and track collective progress toward exams.'],
        ['05', 'fa-handshake', 'Project Partner Finder', 'Match with students who complement your skillset for hackathons, assignments, and research projects.'],
        ['06', 'fa-shield-halved', 'Verified Accounts Only', 'Every account is verified via university email. A trusted, safe environment — no bots, no strangers.']
      ],
      steps: [
        ['fa-envelope-open-text', 'Sign Up with University Email', 'Register using your official .edu email for instant verification and access to your campus network.'],
        ['fa-user-pen', 'Build Your Profile', 'Add skills, current courses, interests, and what you are looking to collaborate on. Make yourself discoverable.'],
        ['fa-compass', 'Discover & Filter', 'Browse students across departments, search by skill, join study groups, or post a project listing.'],
        ['fa-link', 'Connect & Collaborate', 'Send a request, start a conversation, and begin building something meaningful together on campus.']
      ],
      footer: {
        email: 'hello@campusconnect.edu',
        phone: '+91 98765 43210',
        location: 'Mumbai, India'
      },
      recentStudents,
      recentGroups,
      liveStats: {
        userCount,
        connCount,
        groupCount,
        messageCount
      }
    }, 'Home data retrieved successfully');
  } catch (err) {
    next(err);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);

const http = require('http');
const { initSocket } = require('./socket');

// Centralized Error Handling Middleware
app.use(errorHandler);

const normalizePort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : 5000;
};

const httpServer = http.createServer(app);
initSocket(httpServer);

const startServer = (port = normalizePort(PORT), attempt = 1) => {
  httpServer.listen(port, '0.0.0.0', () => {
    logger.info(`Server running on port ${port} with Socket.IO real-time engine`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 10) {
      const fallbackPort = normalizePort(port + 1);
      logger.warn(`Port ${port} is busy, trying ${fallbackPort} instead.`);
      startServer(fallbackPort, attempt + 1);
    } else {
      logger.error('Server failed to start:', err.message);
      process.exit(1);
    }
  });
};

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    logger.info('MongoDB connected');
  })
  .catch((err) => {
    logger.error(`MongoDB connection failed: ${err.message || err.toString()}`);
  });

startServer();

module.exports = { app, httpServer, startServer };
