import React from 'react';
import './BusCard.css';

const BusCard = ({ bus }) => {
  const getPriceChangeClass = (change) => {
    if (change > 0) return 'price-up';
    if (change < 0) return 'price-down';
    return '';
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  const getPriceChangeIcon = (change) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '=';
  };

  return (
    <div className={`bus-card ${bus.isLive ? 'live' : ''}`}>
      <div className="bus-header">
        <div className="bus-name">
          <h3>{bus.operatorName}</h3>
          <span className="bus-type">{bus.busType}</span>
        </div>
        {bus.isLive && (
          <div className="live-indicator">
            <span className="pulse"></span>
            <span>Live</span>
          </div>
        )}
      </div>

      <div className="bus-route">
        <div className="route-info">
          <div className="departure">
            <span className="time">{formatTime(bus.departureTime)}</span>
            <span className="location">{bus.source}</span>
          </div>
          <div className="route-line">
            <div className="duration">{bus.duration}</div>
            <div className="line"></div>
          </div>
          <div className="arrival">
            <span className="time">{formatTime(bus.arrivalTime)}</span>
            <span className="location">{bus.destination}</span>
          </div>
        </div>
      </div>

      <div className="bus-details">
        <div className="detail-item">
          <span className="label">Seats Available</span>
          <span className="value seats">{bus.seatsAvailable}/{bus.totalSeats}</span>
        </div>
        <div className="detail-item">
          <span className="label">Rating</span>
          <span className="value rating">⭐ {bus.rating}</span>
        </div>
      </div>

      <div className="bus-pricing">
        <div className="current-price">
          <span className="label">Current Price</span>
          <span className="price">{formatPrice(bus.currentPrice)}</span>
        </div>
        {bus.priceChange !== 0 && (
          <div className={`price-change ${getPriceChangeClass(bus.priceChange)}`}>
            <span className="icon">{getPriceChangeIcon(bus.priceChange)}</span>
            <span className="amount">{formatPrice(Math.abs(bus.priceChange))}</span>
          </div>
        )}
      </div>

      <div className="bus-actions">
        <button className="btn-secondary">View Details</button>
        <button className="btn-primary">Book Now</button>
      </div>
    </div>
  );
};

export default BusCard;
