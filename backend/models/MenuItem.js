const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }, // URL or path
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
