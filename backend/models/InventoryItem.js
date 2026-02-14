const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['pool', 'cafe', 'general'] },
  totalStock: { type: Number, required: true, default: 0 },
  used: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  unit: { type: String, required: true, default: 'units' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
