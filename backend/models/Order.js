const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Optional: link to a booking
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, // Optional: for walk-ins or specific table orders
  customer_name: String, // For walk-ins
  items: [{
    menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    name: String, // Snapshot of name in case it changes
    price: Number // Snapshot of price
  }],
  status: { type: String, enum: ['Pending', 'Preparing', 'Served', 'Paid'], default: 'Pending' },
  total_amount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
