import React, { useState } from 'react';
import './ItemCard.css';

const ItemCard = ({
  id,
  name,
  location,
  description,
  date,
  initialStatus = 'active',
  imageUrl, // New prop for image source
  onEdit,
  onStatusChange
}) => {
  const [status, setStatus] = useState(initialStatus);

  const toggleStatus = () => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="item-card">
      {/* Status Indicator */}
      <div className="status-container">
        <span className="status-label">status</span>
        <button 
          className={`status-toggle ${status}`}
          onClick={toggleStatus}
          aria-label={`Toggle status: currently ${status}`}
        >
          <div className="status-indicator"></div>
        </button>
      </div>

      {/* Main Content */}
      <div className="card-content">
        {/* Item Image Container */}
        <div className="image-container">
          <img 
            src={imageUrl} 
            alt={name} 
            className="item-image" 
            onError={(e) => {
              e.target.src = "/api/placeholder/150/150"; // Fallback image if the provided URL fails
            }}
          />
        </div>

        {/* Item Details */}
        <div className="item-details">
          <div className="detail-row">item: {name}</div>
          <div className="detail-row">name: {name}</div>
          <div className="detail-row">location: {location}</div>
          <div className="detail-row">description: {description}</div>
          <div className="detail-row">date: {date}</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="card-footer">
        <button className="edit-button" onClick={onEdit}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          EDIT
        </button>
        <div className="item-id">ITEM ID: {id}</div>
      </div>
    </div>
  );
};

export default ItemCard;
