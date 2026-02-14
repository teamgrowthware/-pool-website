import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import MenuCard from './MenuCard';
import './Menu.css';
import API_BASE_URL from '../config';

const Menu = () => {
  const [category, setCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/menu`)
      .then(res => res.json())
      .then(data => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });
  }, []);

  const filteredItems = category === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === category);

  const categories = ['All', 'Drinks', 'Snacks', 'Mains', 'Dessert'];

  if (loading) {
    return (
      <div className="menu-page">
        <Navbar />
        <div className="menu-container">
          <header className="menu-header">
            <h1>Loading <span className="highlight">Menu...</span></h1>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <Navbar />
      <div className="menu-container">
        <header className="menu-header">
          <h1>Exquisite <span className="highlight">Dining</span></h1>
          <p>Fuel your game with our gourmet selection.</p>
        </header>

        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map(item => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
