import React from 'react';
import { Link } from 'react-router-dom';
import Scene3D from './Scene3D';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-section">
      {/* 3D Scene Background */}
      <Scene3D />

      <div className="hero-content">
        <h1>Experience the <span className="highlight">Ultimate</span> <br /> Pool & Snooker Lounge</h1>
        <p>Book your premium table now and elevate your game.</p>
      </div>

      <div className="hero-widget">
        <Link to="/booking" className="hero-cta-btn">
          Book Your Table
        </Link>
      </div>


    </div>
  );
};

export default Hero;
