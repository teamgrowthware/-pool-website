import React, { useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

import API_BASE_URL from '../config';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const url = `${API_BASE_URL}/bookings/user/${user.id}`;
      console.log("Fetching bookings for user ID:", user.id, "from URL:", url);

      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log("Bookings fetched:", data);
          setBookings(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching bookings:", err);
          setLoading(false);
          setError(`Error loading bookings: ${err.message}`);
        });
    } else {
      console.warn("User object is null/undefined in Profile.jsx");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <h2>Please Login to view your profile.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-circle">{user.username.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <h2>{user.username}</h2>
            <p>{user.email}</p>
            <span className="badge">{user.role || 'Member'}</span>
          </div>
          <button onClick={logout} className="logout-action-btn">Logout</button>
        </div>

        <div className="bookings-section">
          <h3>My Bookings</h3>
          {error && <p className="error-text">{error}</p>}
          {loading ? <p>Loading bookings...</p> : (
            bookings.length === 0 ? <p>No bookings yet.</p> : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-info">
                      <h4>Table {booking.table_id ? booking.table_id.number : 'Unknown'} ({booking.table_id ? booking.table_id.type : 'N/A'})</h4>
                      <p className="booking-date">
                        {new Date(booking.start_time).toLocaleDateString()} |
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="booking-status">
                      <span className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</span>
                      <p className="price">${booking.total_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
