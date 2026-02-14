import React from 'react';
import Navbar from './Navbar';
import BookingWidget from './BookingWidget';
import Scene3D from './Scene3D';
import './BookingPage.css';

const BookingPage = () => {
  return (
    <div className="booking-page">
      <div className="booking-scene-bg">
        <Scene3D />
      </div>
      <Navbar />
      <div className="booking-container">
        <BookingWidget />
      </div>
    </div>
  );
};

export default BookingPage;
