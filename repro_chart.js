const http = require('http');

const API_BASE = 'http://localhost:5000/api/admin';

// Helper to make requests
const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin${path}`,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const run = async () => {
  try {
    console.log('--- 1. Initial Stats ---');
    const funcStats1 = await request('GET', '/dashboard-stats');
    const todayStats1 = funcStats1.dailyStats[funcStats1.dailyStats.length - 1];
    console.log('Today:', todayStats1);

    console.log('\n--- 2. Creating New Pending Booking ---');
    // We need a valid table ID. Fetching tables first.
    const tables = await request('GET', '/tables');
    const tableId = tables[0].id; // Use first table. Note: /tables returns mapped object with 'id'

    const booking = await request('POST', '/bookings/start', {
      tableId: tableId,
      customerName: 'Test Chart Update',
      phone: '9999999999',
      duration: 60
    });
    console.log('Created Booking:', booking._id, booking.status);

    console.log('\n--- 3. Stats Check (Should be same) ---');
    const funcStats2 = await request('GET', '/dashboard-stats');
    const todayStats2 = funcStats2.dailyStats[funcStats2.dailyStats.length - 1];
    console.log('Today:', todayStats2);

    console.log('\n--- 4. Confirming Booking ---');
    // The /start endpoint creates it as 'Confirmed' by default in the current implementation?
    // Let's check routes/admin.js: router.post('/bookings/start' ... status: 'Confirmed'

    // Ah, wait. The 'bookings/start' endpoint sets status='Confirmed' immediately.
    // If the user is saying "I explicitly confirmed it", they probably used the "Pending" -> "Confirmed" flow in the Bookings list.
    // Let's force update it to Pending first to simulate.

    await request('PUT', `/bookings/${booking._id}/status`, { status: 'Pending' });
    console.log('Set to Pending.');

    const funcStats3 = await request('GET', '/dashboard-stats');
    const todayStats3 = funcStats3.dailyStats[funcStats3.dailyStats.length - 1];
    console.log('Today (after Pending):', todayStats3);

    await request('PUT', `/bookings/${booking._id}/status`, { status: 'Confirmed' });
    console.log('Set to Confirmed.');

    console.log('\n--- 5. Final Stats Check (Should increment) ---');
    const funcStats4 = await request('GET', '/dashboard-stats');
    const todayStats4 = funcStats4.dailyStats[funcStats4.dailyStats.length - 1];
    console.log('Today:', todayStats4);

  } catch (err) {
    console.error(err);
  }
};

run();
