const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for guests
  guest_name: { type: String }, // For walk-ins
  guest_phone: { type: String }, // For walk-ins
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' },
  total_price: { type: Number, default: 0 }, // Can be 0 initially for running sessions
  pre_orders: [{
    menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String, // Store snapshot of name
    quantity: { type: Number },
    price: Number
  }],
  created_at: { type: Date, default: Date.now }
});

// Index for efficient overlap queries
bookingSchema.index({ table_id: 1, start_time: 1, end_time: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
