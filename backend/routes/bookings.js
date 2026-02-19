const express = require('express');
const router = express.Router();
console.log('Loading bookings router...');
const Booking = require('../models/Booking');
const Table = require('../models/Table');

// GET /api/bookings - Get all bookings (optional filter by date)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user_id', 'username').populate('table_id');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/user/:user_id - Get bookings for a specific user
router.get('/user/:user_id', async (req, res) => {
  try {
    console.log(`Fetching bookings for user: ${req.params.user_id}`);
    const bookings = await Booking.find({ user_id: req.params.user_id })
      .populate('table_id')
      .sort({ start_time: -1 }); // Newest first
    console.log(`Found ${bookings.length} bookings.`);
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings - Create a new booking with overlap check
router.post('/', async (req, res) => {
  const { user_id, table_id, start_time, end_time, total_price, pre_orders, guest_name, guest_phone } = req.body;

  console.log("Received Booking Request:", JSON.stringify(req.body, null, 2));

  try {
    // 1. Convert strings to Date objects
    const start = new Date(start_time);
    const end = new Date(end_time);

    // 2. Overlap Key Logic: (StartA < EndB) AND (EndA > StartB)
    const conflictingBooking = await Booking.findOne({
      table_id: table_id,
      status: { $nin: ['Cancelled', 'Rejected'] }, // Check all active/valid bookings
      $or: [
        { start_time: { $lt: end, $gte: start } },
        { end_time: { $gt: start, $lte: end } },
        { start_time: { $lte: start }, end_time: { $gte: end } }
      ]
    });

    if (conflictingBooking) {
      console.warn("Booking Conflict Detected:", conflictingBooking);
      return res.status(409).json({ message: 'Table is already booked during this time slot.' });
    }

    // 3. Create Booking
    const newBooking = new Booking({
      user_id,
      table_id,
      start_time: start,
      end_time: end,
      total_price,
      pre_orders, // Ensure pre_orders are passed
      guest_name,
      guest_phone
    });

    const savedBooking = await newBooking.save();
    console.log("Booking Saved Successfully:", savedBooking._id);
    res.status(201).json(savedBooking);

  } catch (err) {
    console.error("Booking Creation Error:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
