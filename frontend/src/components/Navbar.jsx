import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Pool<span className="highlight">Lounge</span>
        </Link>
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/menu" className="nav-links" onClick={toggleMenu}>
              Cafe Menu
            </Link>
          </li>

          {user ? (
            <>
              <li className="nav-item">
                <Link to="/profile" className="nav-links user-greeting">
                  Hi, {user.username}
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-links logout-btn" onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-links" onClick={toggleMenu}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
