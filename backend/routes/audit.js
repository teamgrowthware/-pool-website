const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// GET /api/audit - Get all audit logs (Admin only)
router.get('/', roleCheck(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, action, resource, search } = req.query;
    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;

    // Search by actor username or details
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'actor.username': searchRegex },
        { 'details': searchRegex } // Might need more specific search on details fields if strict
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AuditLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
