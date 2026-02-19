import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaClock, FaUtensils, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './BookingWidget.css';

import API_BASE_URL from '../config';

const BookingWidget = () => {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [formData, setFormData] = useState({
    players: '2',
    name: '',
    phone: ''
  });
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  // Fetch Tables
  useEffect(() => {
    fetch(`${API_BASE_URL}/tables`)
      .then(res => res.json())
      .then(data => {
        setTables(data);
        if (data.length > 0) setSelectedTable(data[0]._id);
      })
      .catch(err => console.error("Error fetching tables:", err));
  }, []);

  // Menu Integration
  const [menuItems, setMenuItems] = useState([]);
  const [preOrders, setPreOrders] = useState({}); // { itemId: quantity }
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (step === 2 && menuItems.length === 0) {
      setLoadingMenu(true);
      fetch(`${API_BASE_URL}/menu`)
        .then(res => res.json())
        .then(data => {
          setMenuItems(data);
          setLoadingMenu(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingMenu(false);
        });
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleQuantityChange = (itemId, change) => {
    setPreOrders(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    // Fill name if logged in
    if (user && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.username }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to book a table!");
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Construct Pre-order array
      const preOrderList = Object.entries(preOrders).map(([id, qty]) => {
        const item = menuItems.find(i => i._id === id);
        return {
          menu_item_id: id,
          quantity: qty,
          price: item ? item.price : 0
        };
      });

      // Combine Date and Time
      const combinedStart = new Date(startDate);
      const timeComponent = new Date(startTime);
      combinedStart.setHours(timeComponent.getHours());
      combinedStart.setMinutes(timeComponent.getMinutes());
      combinedStart.setSeconds(0);
      combinedStart.setMilliseconds(0);

      // Use selected duration
      const combinedEnd = new Date(combinedStart.getTime() + duration * 60 * 60 * 1000);

      // Get selected table details
      const tableDetails = tables.find(t => t._id === selectedTable);
      const hourlyRate = tableDetails ? (tableDetails.rate_per_hour || 20) : 20;

      const payload = {
        user_id: user ? user.id : undefined, // Send user_id only if logged in
        guest_name: formData.name, // Always send the name entered in the form
        guest_phone: formData.phone, // Always send the phone entered in the form
        table_id: selectedTable,
        start_time: combinedStart,
        end_time: combinedEnd,
        total_price: (hourlyRate * duration) + preOrderList.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        pre_orders: preOrderList
      };

      // Simulate Network Delay 
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Submitting Booking Payload:", payload);

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking Failed');
      }

      const data = await response.json();
      console.log("Booking Success:", data);

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setStep(1);
        setStartDate(null);
        setStartTime(null);
        setDuration(1); // Reset duration
        setPreOrders({});
      }, 3000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Booking failed. ' + err.message);
      alert('Booking Failed: ' + err.message);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!startDate || !startTime || !formData.name) {
      setErrorMessage('Please fill in all details.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const prevStep = () => setStep(1);

  // Helper to get current rate
  const getCurrentRate = () => {
    const t = tables.find(t => t._id === selectedTable);
    return t ? (t.rate_per_hour || 20) : 20;
  };

  return (
    <div className={`booking-widget ${status === 'success' ? 'success-mode' : ''} ${step === 2 ? 'wide-mode' : ''}`}>
      {status === 'success' ? (
        <div className="success-message">
          <div className="check-icon">✓</div>
          <h2>Table & Food Reserved!</h2>
          <p>We'll have everything ready for you.</p>
        </div>
      ) : (
        <>
          <h2>{step === 1 ? 'Reserve Your Table' : 'Pre-order Food (Optional)'}</h2>

          <form onSubmit={step === 2 ? handleSubmit : nextStep}>

            {/* STEP 1: BOOKING DETAILS */}
            <div className={step === 1 ? 'step-content active' : 'step-content'}>
              <div className="form-row">
                <div className="form-group custom-datepicker-group">
                  <label><FaCalendarAlt /> Date</label>
                  <DatePicker
                    selected={startDate} onChange={(date) => setStartDate(date)}
                    minDate={new Date()}
                    placeholderText="Select Date" className="react-datepicker-input" required={step === 1}
                  />
                </div>
                <div className="form-group custom-datepicker-group">
                  <label><FaClock /> Time</label>
                  <DatePicker
                    selected={startTime} onChange={(date) => setStartTime(date)}
                    showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption="Time" dateFormat="h:mm aa"
                    placeholderText="Select Time" className="react-datepicker-input" required={step === 1}
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FaClock /> Duration ({duration} hrs @ ₹{getCurrentRate()}/hr)</label>
                <div className="duration-selector">
                  {[1, 2, 3, 4].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDuration(h)}
                      className={`duration-btn ${duration === h ? 'active' : ''}`}
                      style={{ marginRight: '5px', padding: '5px 10px', borderRadius: '5px', border: duration === h ? '1px solid #00f' : '1px solid #ccc', background: duration === h ? '#e0f0ff' : '#fff' }}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  Estimated Cost: <b>₹{getCurrentRate() * duration}</b>
                </div>
              </div>

              <div className="form-group">
                <label>Table</label>
                <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                  {tables.map(t => (
                    <option key={t._id} value={t._id}>
                      Table {t.table_number || t.number} ({t.type}) - ₹{t.rate_per_hour}/hr
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Players</label>
                <select id="players" value={formData.players} onChange={handleChange}>
                  <option value="2">2 Players</option>
                  <option value="4">4 Players</option>
                </select>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" id="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required={step === 1} />
              </div>
              <button type="submit" className="cta-button">
                Select Food <FaArrowRight style={{ marginLeft: '8px' }} />
              </button>
            </div>

            {/* STEP 2: PRE-ORDER MENU */}
            <div className={step === 2 ? 'step-content active' : 'step-content hidden'}>
              <div className="preorder-list">
                {loadingMenu ? <p>Loading Menu...</p> : (
                  menuItems.map(item => (
                    <div key={item._id} className="preorder-item">
                      <span>{item.name} (${item.price})</span>
                      <div className="qty-controls">
                        <button type="button" onClick={() => handleQuantityChange(item._id, -1)}>-</button>
                        <span>{preOrders[item._id] || 0}</span>
                        <button type="button" onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="step-actions">
                <button type="button" className="back-btn" onClick={prevStep}>
                  <FaArrowLeft /> Back
                </button>
                <div className="action-right">
                  <button type="button" className="skip-btn" onClick={handleSubmit}>
                    Skip Food
                  </button>
                  <button type="submit" className={`cta-button ${status === 'loading' ? 'loading' : ''}`} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Booking...' : (Object.keys(preOrders).length > 0 ? 'Confirm Order' : 'Confirm Booking')}
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && <p className="error-text" style={{ textAlign: 'center', marginTop: '10px' }}>{errorMessage}</p>}
          </form>
        </>
      )}
    </div>
  );
};

export default BookingWidget;
