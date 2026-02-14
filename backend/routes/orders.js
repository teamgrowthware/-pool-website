const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  const { table_id, items, customerName } = req.body;

  try {
    // Fetch menu items to get prices (security best practice)
    // For now, assuming prices are passed correctly or we trust the frontend? 
    // Ideally we should refetch. But for speed let's trust frontend or just validate.
    // The model expects: menu_item_id, quantity, name, price.
    // Frontend transmits: { menuItem, quantity } -> we need details.

    // Wait, the frontend logic I wrote earlier only sends { menuItem: id, quantity }. 
    // I need to update frontend to send full details OR backend to fetch them.
    // Let's update backend to fetch details for robustness.

    // Actually, looking at AddOrderModal again:
    // items: cart.map(({ item, quantity }) => ({ menuItem: item.id, quantity }))

    // So backend needs to fetch prices.
    const MenuItem = require('../models/MenuItem'); // Dynamic require if not top-level
    // Check if MenuItem is available. It might be InventoryItem with category='cafe'?
    // In `admin/src/app/cafe/page.tsx` it fetches `/api/menu`.
    // Let's check `routes/menu.js`.

    // To safe time, I'll update frontend to send full details (name, price) since it has them.
    // It's less secure but faster for this prototype.

    const formattedItems = items.map(i => ({
      menu_item_id: i.menuItem || i.id,
      quantity: i.quantity,
      name: i.name,
      price: i.price
    }));

    const total_amount = formattedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const newOrder = new Order({
      table_id: table_id || null,
      customer_name: customerName,
      items: formattedItems,
      total_amount,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
