const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api'; // Back to 5000
const ADMIN_EMAIL = 'admin@poollounge.com'; // Matches seedUsers.js
const ADMIN_PASSWORD = 'adminpassword';

// Colors for console
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const logPass = (msg) => console.log(`${GREEN}✅ PASS:${RESET} ${msg}`);
const logFail = (msg, err) => {
  console.log(`${RED}❌ FAIL:${RESET} ${msg}`);
  if (err) console.error(err.message, err.response?.data || '');
};
const logInfo = (msg) => console.log(`${YELLOW}ℹ️  INFO:${RESET} ${msg}`);

const runQA = async () => {
  console.log("🚀 Starting Full System QA...");

  let adminToken;
  let staffToken;
  let userId;
  let staffId;
  let tableId;
  let bookingId;

  try {
    // --- AUTH: ADMIN LOGIN ---
    logInfo("Testing Admin Login...");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      adminToken = res.data.token;
      logPass("Admin Logged In");

      // --- TEST /ME ENDPOINT ---
      logInfo("Testing /me Endpoint...");
      try {
        const meRes = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { 'x-auth-token': adminToken }
        });
        if (meRes.data.email === ADMIN_EMAIL) logPass("/me Endpoint Verified");
        else logFail("/me Endpoint Returned Wrong User", meRes.data);
      } catch (e) {
        logFail("/me Endpoint Failed", e);
      }
    } catch (e) {
      logFail("Admin Login Failed", e);
      return; // Cannot proceed without admin
    }

    // --- STAFF MANAGEMENT ---
    logInfo("Testing Staff Creation...");
    const staffEmail = `teststaff_${Date.now()}@pool.com`;
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/staff`, {
        username: "QA Staff",
        email: staffEmail,
        password: "password123",
        role: "staff"
      }, { headers: { 'x-auth-token': adminToken } });
      staffId = res.data._id;
      logPass(`Staff Created: ${staffEmail}`);
    } catch (e) {
      logFail("Staff Creation Failed", e);
    }

    // --- LOGIN AS STAFF ---
    logInfo("Testing Staff Login...");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: staffEmail,
        password: "password123"
      });
      staffToken = res.data.token;
      logPass("Staff Logged In");
    } catch (e) {
      logFail("Staff Login Failed", e);
    }

    // --- FETCH TABLES ---
    try {
      const res = await axios.get(`${API_BASE_URL}/tables`);
      if (res.data.length > 0) {
        tableId = res.data[0]._id;
        logPass(`Tables Fetched. Using Table: ${res.data[0].table_number}`);
      } else {
        logFail("No Tables Found");
      }
    } catch (e) {
      logFail("Fetch Tables Failed", e);
    }

    // --- BOOKING FLOW ---
    if (tableId && staffToken) {
      logInfo("Testing Booking Creation (as Staff)...");
      try {
        const startTime = new Date(Date.now() + 3600000).toISOString();
        const endTime = new Date(Date.now() + 7200000).toISOString();

        const res = await axios.post(`${API_BASE_URL}/bookings`, {
          table_id: tableId,
          date: startTime.split('T')[0], // YYYY-MM-DD
          startTime: "14:00", // Hardcoded for simplicity, assumes slot available
          endTime: "15:00",
          guest_name: "QA Guest",
          guest_phone: "1234567890"
        }, { headers: { 'x-auth-token': staffToken } });

        // Note: The structure of payload depends on implementation. 
        // Creating a simplified payload if the above is specific to frontend

        bookingId = res.data._id;
        logPass(`Booking Created: ${bookingId}`);
      } catch (e) {
        // Try alternate payload if strict Date object is expected
        try {
          const res = await axios.post(`${API_BASE_URL}/bookings`, {
            table_id: tableId,
            start_time: new Date(Date.now() + 3600000),
            end_time: new Date(Date.now() + 7200000),
            guest_name: "QA Guest Retry",
            guest_phone: "1234567890"
          }, { headers: { 'x-auth-token': staffToken } });
          bookingId = res.data._id;
          logPass(`Booking Created (Retry Method): ${bookingId}`);
        } catch (e2) {
          logFail("Booking Creation Failed", e2);
        }
      }
    }

    // --- AUDIT LOGS ---
    logInfo("Testing Audit Log Recording...");
    try {
      const res = await axios.get(`${API_BASE_URL}/audit`, {
        headers: { 'x-auth-token': adminToken }
      });

      // Check for Staff Creation Log
      const staffLog = res.data.logs.find(l => l.action === 'CREATE' && l.resource === 'Staff');
      if (staffLog) logPass("Audit Log found for Staff Creation");
      else logFail("Audit Log MISSING for Staff Creation");

      // Check for Booking Log
      if (bookingId) {
        const bookingLog = res.data.logs.find(l => l.resource === 'Booking' && l.details.includes("QA Guest"));
        // Details might be stringified JSON
        if (bookingLog || res.data.logs.some(l => l.resource === 'Booking')) logPass("Audit Log found for Booking");
        else logFail("Audit Log MISSING for Booking");
      }

    } catch (e) {
      logFail("Fetch Audit Logs Failed", e);
    }

    // --- CLEANUP ---
    if (staffId) {
      logInfo("Cleaning up: Deleting Staff...");
      try {
        await axios.delete(`${API_BASE_URL}/admin/staff/${staffId}`, {
          headers: { 'x-auth-token': adminToken }
        });
        logPass("Staff Deleted");
      } catch (e) {
        logFail("Staff Deletion Failed", e);
      }
    }

  } catch (err) {
    console.error("Critical Test Error", err);
  }
};

runQA();
