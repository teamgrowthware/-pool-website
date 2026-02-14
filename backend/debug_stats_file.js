const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const fs = require('fs');
require('dotenv').config();

const runDebug = async () => {
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_stats_output.txt', msg + '\n');
  };

  try {
    fs.writeFileSync('debug_stats_output.txt', '--- START DEBUG ---\n');
    await mongoose.connect(process.env.MONGODB_URI);
    log('Connected to MongoDB');

    // 1. Check raw bookings
    const allBookings = await Booking.find({}).sort({ created_at: -1 }).limit(5);
    log('\n--- Sample Raw Bookings (Latest 5) ---');
    allBookings.forEach(b => {
      log(`ID: ${b._id}, Status: "${b.status}", Created: ${b.created_at} (${typeof b.created_at})`);
    });

    // 2. Check counts by status
    const statusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    log('\n--- Counts by Status ---');
    log(JSON.stringify(statusCounts, null, 2));

    // 3. Simulating the dashboard Daily Stats Aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    log(`\n--- Date Filter: >= ${thirtyDaysAgo.toISOString()} ---`);

    const dailyStatsAgg = await Booking.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo },
          // status: { $in: ['Confirmed', 'Completed'] } 
          // REMOVED STATUS FILTER FOR DEBUGGING to see if it's a status issue
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$created_at" },
            month: { $month: "$created_at" },
            year: { $year: "$created_at" },
            status: "$status" // Group by status too to see breakdown
          },
          count: { $sum: 1 }
        }
      }
    ]);

    log('\n--- Aggregation Result (Grouped by Day & Status) ---');
    log(JSON.stringify(dailyStatsAgg, null, 2));

    process.exit(0);
  } catch (err) {
    log('ERROR: ' + err.message);
    process.exit(1);
  }
};

runDebug();
