const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

const endpoints = [
  { url: '/admin/dashboard-stats', name: 'Dashboard Stats', roles: ['admin'] },
  { url: '/admin/tables', name: 'Pool Tables', roles: ['admin', 'manager', 'staff'] },
  { url: '/admin/bookings', name: 'Bookings List', roles: ['admin', 'manager', 'staff'] },
  { url: '/menu', name: 'Cafe Menu', public: true }, // Menu might be public
  { url: '/orders', name: 'Cafe Orders', public: true }, // Verify if this is public or staff
  { url: '/inventory', name: 'Inventory', roles: ['admin', 'manager'] },
  { url: '/admin/clients', name: 'Clients List', roles: ['admin', 'manager'] },
  { url: '/admin/staff', name: 'Staff List', roles: ['admin'] },
  { url: '/admin/settings', name: 'Business Settings', roles: ['admin'] },
  { url: '/admin/cafe-stats', name: 'Cafe Stats', roles: ['admin', 'manager'] }
];

async function loginAdmin() {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'adminpassword' }) // Replace with valid defaults from seed
    });
    if (res.ok) {
      const data = await res.json();
      return data.token;
    }
    console.log('Admin Login Failed:', await res.text());
    return null;
  } catch (err) {
    console.log('Admin Login Error:', err.message);
    return null;
  }
}

async function testEndpoints() {
  console.log('Starting System-wide API Verification...\n');
  const token = await loginAdmin();
  const headers = token ? { 'x-auth-token': token } : {};
  console.log(`Authenticated: ${!!token}\n`);
  let successCount = 0;
  let failCount = 0;


  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint.url}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const isArray = Array.isArray(data);
        const count = isArray ? data.length : Object.keys(data).length;
        console.log(`[PASS] ${endpoint.name} (${endpoint.url})`);
        console.log(`       Status: ${res.status}`);
        console.log(`       Type: ${isArray ? 'Array' : 'Object'}`);
        console.log(`       Items/Keys: ${count}`);
        successCount++;
      } else {
        console.log(`[FAIL] ${endpoint.name} (${endpoint.url})`);
        console.log(`       Status: ${res.status}`);
        console.log(`       Text: ${await res.text()}`);
        failCount++;
      }
    } catch (err) {
      console.log(`[ERR ] ${endpoint.name} (${endpoint.url})`);
      console.log(`       Error: ${err.message}`);
      failCount++;
    }
    console.log('------------------------------------------------');
  }

  console.log(`\nVerification Complete.`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

testEndpoints();
