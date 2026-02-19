const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
  },
  resource: {
    type: String,
    required: true,
    enum: ['Booking', 'Menu', 'Staff', 'Settings', 'Order', 'Inventory', 'Table']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resource'
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    role: String,
    ip: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed // JSON object with changed fields or snapshot
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for fast querying by resource or actor
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ 'actor.id': 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
