const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET /api/tables - Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tables/:id - Update table details
router.put('/:id', async (req, res) => {
  console.log(`Updating table ${req.params.id} with`, req.body);
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    if (req.body.rate_per_hour) table.rate_per_hour = req.body.rate_per_hour;
    if (req.body.status) table.status = req.body.status;

    // Optional: Allow updating name/number if needed, but usually fixed.

    await table.save();
    res.json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
