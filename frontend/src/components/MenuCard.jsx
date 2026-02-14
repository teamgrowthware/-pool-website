import React from 'react';
import './MenuCard.css';

const MenuCard = ({ item, onAdd = () => { } }) => {
  return (
    <div className="menu-card">
      <div className="card-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3>{item.name}</h3>
          <span className="price">${item.price.toFixed(2)}</span>
        </div>
        <p className="description">{item.description}</p>
        <button className="add-btn" onClick={() => onAdd(item)}>Add to Order</button>
      </div>
    </div>
  );
};

export default MenuCard;
