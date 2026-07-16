const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const dashboardRoutes = require('./routes/dashboard');
const noticesRoutes = require('./routes/notices');
const resourcesRoutes = require('./routes/resources');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');
const generalRoutes = require('./routes/general');

dotenv.config();

let lastConnError = null;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/assets/uploads', express.static(path.join(__dirname, '../assets/uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/db-debug', (req, res) => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
  let obfuscatedUri = uri;
  try {
    const urlObj = new URL(uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
    obfuscatedUri = `${uri.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb'}://***:***@${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    obfuscatedUri = 'Failed to parse URI for obfuscation';
  }

  res.json({
    readyState: mongoose.connection.readyState,
    readyStateLabel: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    lastError: lastConnError,
    uriUsed: obfuscatedUri,
    hasMongoUriEnv: !!process.env.MONGO_URI,
    hasMongodbUriEnv: !!process.env.MONGODB_URI,
  });
});

const User = require('./models/User');
const Group = require('./models/Group');
const Connection = require('./models/Connection');
const Message = require('./models/Message');

app.get('/api/home', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const groupCount = await Group.countDocuments();
    const connCount = await Connection.countDocuments({ status: 'accepted' });
    const messageCount = await Message.countDocuments();

    // Fetch 6 recent students
    const recentStudents = await User.find({}, 'name department semester university skills isOnline avatar')
      .sort({ _id: -1 })
      .limit(6);

    // Fetch 6 recent groups
    const recentGroups = await Group.find()
      .populate('createdBy', 'name')
      .sort({ _id: -1 })
      .limit(6);

    res.json({
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
        ['03', 'fa-comment-dots', 'Real-Time Messaging', 'Encrypted direct messages with read receipts, file sharing, and group threads — no third-party apps needed.'],
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
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/general', generalRoutes);

const normalizePort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : 5000;
};

const startServer = (port = normalizePort(PORT), attempt = 1) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 10) {
      const fallbackPort = normalizePort(port + 1);
      console.warn(`Port ${port} is busy, trying ${fallbackPort} instead.`);
      startServer(fallbackPort, attempt + 1);
    } else {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    }
  });
};

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    lastConnError = err.message || err.toString();
    console.error('MongoDB connection failed:', err.message);
  });

startServer();

module.exports = { app, startServer };
