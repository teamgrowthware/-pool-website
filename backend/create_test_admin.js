require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const email = 'admin@example.com';
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin user already exists. Updating role/password to ensure access.');
      admin.role = 'admin';
      admin.password_hash = hashedPassword;
      await admin.save();
    } else {
      admin = new User({
        username: 'Admin User',
        email,
        password_hash: hashedPassword,
        role: 'admin',
        phone: '1234567890'
      });
      await admin.save();
      console.log('Admin user created.');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
