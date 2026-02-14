const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const users = [
  {
    username: 'Super Admin',
    email: 'admin@poollounge.com',
    password: 'adminpassword',
    role: 'admin'
  },
  {
    username: 'Manager John',
    email: 'manager@poollounge.com',
    password: 'managerpassword',
    role: 'manager'
  },
  {
    username: 'Staff Sarah',
    email: 'staff@poollounge.com',
    password: 'staffpassword',
    role: 'staff'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`User ${user.email} already exists`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, salt);

      await User.create({
        username: user.username,
        email: user.email,
        password_hash,
        role: user.role
      });

      console.log(`Created user: ${user.username} (${user.role})`);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
