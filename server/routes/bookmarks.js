const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const Project = require('../models/Project');
const Event = require('../models/Event');
const Group = require('../models/Group');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   POST /api/bookmarks/toggle
 * @desc    Toggle bookmark on/off for any item
 * @access  Private
 */
router.post('/toggle', auth, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return sendError(res, 'itemType and itemId are required', 400, 'INVALID_PAYLOAD');
    }

    const validTypes = ['project', 'event', 'group', 'resource'];
    if (!validTypes.includes(itemType)) {
      return sendError(res, `itemType must be one of: ${validTypes.join(', ')}`, 400, 'INVALID_TYPE');
    }

    const existing = await Bookmark.findOne({
      user: req.user.id,
      itemType,
      itemId
    });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return sendSuccess(res, { bookmarked: false, itemType, itemId }, 'Bookmark removed');
    } else {
      const created = await Bookmark.create({
        user: req.user.id,
        itemType,
        itemId
      });
      return sendSuccess(res, { bookmarked: true, itemType, itemId, id: created._id }, 'Bookmark saved', 201);
    }
  } catch (error) {
    return sendError(res, 'Failed to toggle bookmark: ' + error.message, 500, 'BOOKMARK_TOGGLE_ERROR');
  }
});

/**
 * @route   GET /api/bookmarks
 * @desc    Retrieve all saved bookmarks for the authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { itemType } = req.query;
    const filter = { user: req.user.id };
    if (itemType && ['project', 'event', 'group', 'resource'].includes(itemType)) {
      filter.itemType = itemType;
    }

    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).lean();

    // Group and populate items by type
    const projectIds = bookmarks.filter((b) => b.itemType === 'project').map((b) => b.itemId);
    const eventIds = bookmarks.filter((b) => b.itemType === 'event').map((b) => b.itemId);
    const groupIds = bookmarks.filter((b) => b.itemType === 'group').map((b) => b.itemId);
    const resourceIds = bookmarks.filter((b) => b.itemType === 'resource').map((b) => b.itemId);

    const [projects, events, groups, resources] = await Promise.all([
      Project.find({ _id: { $in: projectIds } })
        .populate('userId', 'name department avatar')
        .lean()
        .then((docs) => docs.map((d) => ({ ...d, author: d.userId }))),
      Event.find({ _id: { $in: eventIds } })
        .populate('userId', 'name department avatar')
        .lean()
        .then((docs) => docs.map((d) => ({ ...d, creator: d.userId }))),
      Group.find({ _id: { $in: groupIds } })
        .populate('createdBy', 'name department avatar')
        .lean()
        .then((docs) => docs.map((d) => ({ ...d, creator: d.createdBy }))),
      Resource.find({ _id: { $in: resourceIds } })
        .populate('userId', 'name department avatar')
        .lean()
        .then((docs) => docs.map((d) => ({ ...d, uploadedBy: d.userId })))
    ]);

    const projectMap = new Map(projects.map((p) => [p._id.toString(), p]));
    const eventMap = new Map(events.map((e) => [e._id.toString(), e]));
    const groupMap = new Map(groups.map((g) => [g._id.toString(), g]));
    const resourceMap = new Map(resources.map((r) => [r._id.toString(), r]));

    const populatedBookmarks = bookmarks
      .map((b) => {
        let itemData = null;
        const idStr = b.itemId.toString();
        if (b.itemType === 'project') itemData = projectMap.get(idStr);
        else if (b.itemType === 'event') itemData = eventMap.get(idStr);
        else if (b.itemType === 'group') itemData = groupMap.get(idStr);
        else if (b.itemType === 'resource') itemData = resourceMap.get(idStr);

        return {
          ...b,
          item: itemData
        };
      })
      .filter((b) => b.item !== null && b.item !== undefined); // Remove stale deleted references

    return sendSuccess(res, {
      total: populatedBookmarks.length,
      bookmarks: populatedBookmarks
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch bookmarks: ' + error.message, 500, 'BOOKMARKS_FETCH_ERROR');
  }
});

/**
 * @route   GET /api/bookmarks/ids
 * @desc    Get just the array of saved item IDs for quick client lookup
 * @access  Private
 */
router.get('/ids', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).select('itemType itemId').lean();
    return sendSuccess(res, bookmarks);
  } catch (error) {
    return sendError(res, 'Failed to fetch bookmark IDs: ' + error.message, 500, 'BOOKMARK_IDS_ERROR');
  }
});

module.exports = router;
