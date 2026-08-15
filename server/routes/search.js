const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Event = require('../models/Event');
const Group = require('../models/Group');
const Resource = require('../models/Resource');
const Notice = require('../models/Notice');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/search
 * @desc    Unified multi-collection search engine
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { q = '', category = 'all', limit = 10 } = req.query;
    const query = q.trim();
    const maxLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    if (!query) {
      return sendSuccess(res, {
        query: '',
        totalResults: 0,
        results: {
          students: [],
          projects: [],
          events: [],
          groups: [],
          resources: [],
          notices: []
        }
      });
    }

    // Escape regex special characters for safe keyword searching
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const promises = [];

    // 1. Search Students
    if (category === 'all' || category === 'students') {
      promises.push(
        User.find({
          isDeleted: { $ne: true },
          $or: [
            { name: regex },
            { department: regex },
            { university: regex },
            { skills: { $in: [regex] } }
          ]
        })
          .select('_id name department university skills avatar bio isOnline')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'students', data: docs }))
      );
    }

    // 2. Search Projects
    if (category === 'all' || category === 'projects') {
      promises.push(
        Project.find({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex },
            { tags: { $in: [regex] } }
          ]
        })
          .populate('author', 'name department avatar')
          .select('_id title description category tags likes views author createdAt status')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'projects', data: docs }))
      );
    }

    // 3. Search Events
    if (category === 'all' || category === 'events') {
      promises.push(
        Event.find({
          $or: [
            { title: regex },
            { description: regex },
            { category: regex },
            { venue: regex }
          ]
        })
          .populate('creator', 'name department avatar')
          .select('_id title description category venue eventDate isOnline creator rsvps')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'events', data: docs }))
      );
    }

    // 4. Search Groups / Clubs
    if (category === 'all' || category === 'groups') {
      promises.push(
        Group.find({
          $or: [
            { name: regex },
            { description: regex },
            { category: regex },
            { tags: { $in: [regex] } }
          ]
        })
          .populate('creator', 'name department avatar')
          .select('_id name description category tags members banner creator')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'groups', data: docs }))
      );
    }

    // 5. Search Resources
    if (category === 'all' || category === 'resources') {
      promises.push(
        Resource.find({
          $or: [
            { title: regex },
            { description: regex },
            { subject: regex },
            { department: regex }
          ]
        })
          .populate('uploadedBy', 'name department avatar')
          .select('_id title description subject department fileType upvotes downloads uploadedBy createdAt')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'resources', data: docs }))
      );
    }

    // 6. Search Notices
    if (category === 'all' || category === 'notices') {
      promises.push(
        Notice.find({
          $or: [
            { title: regex },
            { content: regex },
            { category: regex }
          ]
        })
          .populate('author', 'name department avatar')
          .select('_id title content category priority author createdAt')
          .limit(maxLimit)
          .lean()
          .then((docs) => ({ type: 'notices', data: docs }))
      );
    }

    const settled = await Promise.all(promises);

    const formatted = {
      students: [],
      projects: [],
      events: [],
      groups: [],
      resources: [],
      notices: []
    };

    let total = 0;
    for (const item of settled) {
      formatted[item.type] = item.data;
      total += item.data.length;
    }

    return sendSuccess(res, {
      query,
      totalResults: total,
      results: formatted
    });
  } catch (error) {
    return sendError(res, 'Search operation failed: ' + error.message, 500, 'SEARCH_ERROR');
  }
});

module.exports = router;
