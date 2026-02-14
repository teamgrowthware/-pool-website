const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  table_number: { type: Number, required: true, unique: true },
  type: { type: String, enum: ['Pool', 'Snooker'], required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  position_3d: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  rate_per_hour: { type: Number, default: 20 }
});

module.exports = mongoose.model('Table', tableSchema);
