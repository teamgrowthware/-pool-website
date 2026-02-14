const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/dashboard-stats',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Daily Stats (Last 5 days):');
      const daily = json.dailyStats || [];
      console.log(daily.slice(-5));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
