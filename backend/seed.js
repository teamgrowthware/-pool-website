require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('./models/Table');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedTables = async () => {
  const tables = [
    { table_number: 1, type: 'Pool', position_3d: { x: 0, y: 0, z: 0 }, rate_per_hour: 20 },
    { table_number: 2, type: 'Pool', position_3d: { x: 5, y: 0, z: 0 }, rate_per_hour: 20 },
    { table_number: 3, type: 'Snooker', position_3d: { x: -5, y: 0, z: 0 }, rate_per_hour: 25 },
    { table_number: 4, type: 'Pool', position_3d: { x: 0, y: 0, z: 5 }, rate_per_hour: 20 },
  ];

  try {
    await Table.deleteMany({}); // Clear existing
    await Table.insertMany(tables);
    console.log('Tables Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedTables();
