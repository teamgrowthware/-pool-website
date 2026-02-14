const http = require('http');

const endpoints = [
  '/api/admin/dashboard-stats',
  '/api/admin/bookings?limit=3',
  '/api/admin/bookings?date=today',
  '/api/inventory'
];

endpoints.forEach(path => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n--- ${path} ---`);
      console.log(`Status: ${res.statusCode}`);
      try {
        JSON.parse(data);
        console.log('Body: Valid JSON');
        console.log(data.substring(0, 100) + '...');
      } catch (e) {
        console.log('Body: INVALID JSON');
        console.log('First 100 chars:', data.substring(0, 100));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request to ${path}: ${e.message}`);
  });

  req.end();
});
