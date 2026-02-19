const AuditLog = require('../models/AuditLog');

/**
 * Logs an action to the AuditLog collection.
 * 
 * @param {Object} req - The Express request object (to extract actor details).
 * @param {String} resource - The resource being modified (e.g., 'Booking', 'Staff').
 * @param {String} action - The action performed (CREATE, UPDATE, DELETE).
 * @param {String|Object} resourceId - The ID of the resource.
 * @param {Object} details - Additional details about the change (e.g., diff, snapshot).
 */
const logAction = async (req, resource, action, resourceId, details = {}) => {
  try {
    const actor = req.user ? {
      id: req.user.id,
      username: req.user.username || 'System', // Fallback if username not in token, ideally fetch user
      role: req.user.role,
      ip: req.ip || req.connection.remoteAddress
    } : {
      id: null,
      username: 'System',
      role: 'system',
      ip: '127.0.0.1'
    };

    // If username is missing in req.user (JWT often only has id/role), we might want to fetch it or rely on frontend sending it?
    // For now, let's rely on what's available or stored in the token.
    // If username is critical, we should ensure the auth middleware attaches full user or use 'System'.

    // Safety check for resourceId
    const safeResourceId = resourceId && resourceId.toString ? resourceId.toString() : null;

    const logEntry = new AuditLog({
      action,
      resource,
      resourceId: safeResourceId,
      actor,
      details
    });

    await logEntry.save();
    console.log(`[Audit] ${action} on ${resource} by ${actor.username}`);
  } catch (error) {
    console.error('[Audit] Failed to create log:', error);
    // Don't crash the main request if logging fails, just error log it.
  }
};

module.exports = { logAction };
