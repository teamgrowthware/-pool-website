const mongoose = require('mongoose');
const Booking = require('./models/Booking');
require('dotenv').config();

const runDebug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Check raw bookings
    const allBookings = await Booking.find({}).limit(5);
    console.log('\n--- Sample Raw Bookings ---');
    allBookings.forEach(b => {
      console.log(`ID: ${b._id}, Status: "${b.status}", Created: ${b.created_at}`);
    });

    // 2. Check counts by status
    const statusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log('\n--- Counts by Status ---');
    console.log(statusCounts);

    // 3. Simulating the dashboard Daily Stats Aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    console.log(`\n--- Date Filter: >= ${thirtyDaysAgo.toISOString()} ---`);

    const dailyStatsAgg = await Booking.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo },
          status: { $in: ['Confirmed', 'Completed', 'confirmed', 'completed'] } // Testing case sensitivity
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$created_at" },
            month: { $month: "$created_at" },
            year: { $year: "$created_at" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n--- Aggregation Result ---');
    console.log(dailyStatsAgg);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runDebug();
