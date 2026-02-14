const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (Should be in .env, but using fallback for now)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      email,
      password_hash
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

const auth = require('../middleware/auth');

// PUT /api/auth/profile - Update user profile
router.put('/profile', auth, async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;

    // Update password if provided (only if non-empty)
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user info (excluding password)
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Profile updated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/auth/users - Get all users (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const requestUser = await User.findById(req.user.id);
    if (!requestUser || requestUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find({ role: { $in: ['admin', 'manager', 'staff'] } }).select('-password_hash').sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/auth/users/:id - Update a user (Admin only)
router.put('/users/:id', auth, async (req, res) => {
  const { username, email, role, password } = req.body;

  try {
    const requestUser = await User.findById(req.user.id);
    if (!requestUser || requestUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    let userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) userToUpdate.username = username;
    if (email) userToUpdate.email = email;
    if (role) userToUpdate.role = role;

    // Update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.password_hash = await bcrypt.hash(password, salt);
    }

    await userToUpdate.save();

    res.json({
      user: {
        id: userToUpdate._id,
        username: userToUpdate.username,
        email: userToUpdate.email,
        role: userToUpdate.role
      },
      message: 'User updated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
