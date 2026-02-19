const axios = require('axios');

const API_BASE_URL = 'https://pool-backend-54ln.onrender.com/api';
const ADMIN_EMAIL = 'admin@poollounge.com';
const ADMIN_PASSWORD = 'adminpassword';

// Test Data
const GUEST_NAME = "QA Test Guest " + Date.now();
const GUEST_PHONE = "9876543210";

const runQA = async () => {
  console.log("🚀 Starting End-to-End Data Flow QA...");
  console.log(`🎯 Target Guest Name: "${GUEST_NAME}"`);

  let token;
  let userId;
  let tableId;

  try {
    // 1. Login as Admin to get token and user ID
    console.log("\n1️⃣  Logging in...");
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    token = loginRes.data.token;
    userId = loginRes.data.user.id;
    console.log("✅ Login Successful.");

    // 2. Get a Table ID
    console.log("\n2️⃣  Fetching Tables...");
    const tablesRes = await axios.get(`${API_BASE_URL}/tables`);
    if (tablesRes.data.length === 0) throw new Error("No tables found!");
    tableId = tablesRes.data[0]._id;
    console.log(`✅ Table Found: ${tablesRes.data[0].table_number}`);

    // 3. Simulate Frontend Booking Creation
    console.log("\n3️⃣  Simulating Frontend Booking Creation...");
    const bookingPayload = {
      user_id: userId, // Simulating logged-in user
      guest_name: GUEST_NAME, // BUT entering a custom name
      guest_phone: GUEST_PHONE,
      table_id: tableId,
      start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      end_time: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
      total_price: 100,
      pre_orders: []
    };

    const createRes = await axios.post(`${API_BASE_URL}/bookings`, bookingPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    const bookingId = createRes.data._id;
    console.log(`✅ Booking Created! ID: ${bookingId}`);
    console.log(`   Saved guest_name: "${createRes.data.guest_name}"`);

    if (createRes.data.guest_name !== GUEST_NAME) {
      console.error("❌ CRITICAL FAIL: Backend did not save the guest_name correctly!");
    } else {
      console.log("✅ Backend returns correct guest_name in response.");
    }

    // 4. Checking Admin Data (What Dashboard Sees)
    console.log("\n4️⃣  Fetching Admin Bookings List...");
    const adminRes = await axios.get(`${API_BASE_URL}/admin/bookings?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const foundBooking = adminRes.data.find(b => b._id === bookingId);

    if (!foundBooking) {
      console.error("❌ Booking not found in Admin List!");
    } else {
      console.log("✅ Booking found in Admin List.");
      console.log("--- DATA RECEIVED BY DASHBOARD ---");
      console.log(`user_id.username: "${foundBooking.user_id?.username}"`);
      console.log(`guest_name:       "${foundBooking.guest_name}"`);

      if (foundBooking.user_id?.username && foundBooking.guest_name) {
        console.warn("\n⚠️  POTENTIAL DISPLAY ISSUE:");
        console.warn("Both 'user_id.username' AND 'guest_name' are present.");
        console.warn("If Dashboard prioritizes 'user_id', it will show: " + foundBooking.user_id.username);
        console.warn("If Dashboard prioritizes 'guest_name', it will show: " + foundBooking.guest_name);
      }
    }

  } catch (err) {
    console.error("❌ QA Failed:", err.message);
    if (err.response) console.error("   Response:", err.response.data);
  }
};

runQA();
