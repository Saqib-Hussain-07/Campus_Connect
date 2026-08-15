const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   POST /api/reports
 * @desc    Submit a report for content or user profile
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return sendError(res, 'Target type, target ID, and reason are required', 400, 'INVALID_PAYLOAD');
    }

    // Prevent spamming the same report
    const existing = await Report.findOne({
      reporter: req.user.id,
      targetType,
      targetId,
      status: 'pending'
    });

    if (existing) {
      return sendError(res, 'You have already submitted a pending report for this item', 400, 'DUPLICATE_REPORT');
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      details: (details || '').trim(),
      status: 'pending'
    });

    return sendSuccess(res, report, 'Report submitted successfully. Our moderation team will review it.', 201);
  } catch (error) {
    return sendError(res, 'Failed to submit report: ' + error.message, 500, 'REPORT_SUBMISSION_ERROR');
  }
});

/**
 * @route   GET /api/reports
 * @desc    Get reports list with status filter
 * @access  Private (Admin only)
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const query = status !== 'all' ? { status } : {};

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email department avatar')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Report.countDocuments(query)
    ]);

    return sendSuccess(res, {
      reports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve reports: ' + error.message, 500, 'REPORTS_FETCH_ERROR');
  }
});

/**
 * @route   PATCH /api/reports/:id
 * @desc    Resolve or dismiss a report
 * @access  Private (Admin only)
 */
router.patch('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return sendError(res, 'Status must be either resolved or dismissed', 400, 'INVALID_STATUS');
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolutionNotes: (resolutionNotes || '').trim(),
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!report) {
      return sendError(res, 'Report not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, report, `Report marked as ${status}`);
  } catch (error) {
    return sendError(res, 'Failed to update report: ' + error.message, 500, 'REPORT_UPDATE_ERROR');
  }
});

module.exports = router;
