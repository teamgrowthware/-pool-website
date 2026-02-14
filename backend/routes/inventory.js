const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');

// GET /api/inventory - Get all items
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/inventory - Add new item
router.post('/', async (req, res) => {
  const { name, category, totalStock, used, minStock, unit } = req.body;
  const newItem = new InventoryItem({
    name,
    category,
    totalStock,
    used: used || 0,
    minStock,
    unit
  });

  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/inventory/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
