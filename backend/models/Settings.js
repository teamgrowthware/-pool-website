const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  business_name: { type: String, default: 'Poolside Paradise' },
  business_address: { type: String, default: '123 Main St' },
  business_phone: { type: String, default: '' },
  business_email: { type: String, default: '' },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
