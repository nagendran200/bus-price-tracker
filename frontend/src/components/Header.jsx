import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="16" rx="3" fill="#2196F3"/>
              <rect x="6" y="10" width="4" height="6" rx="1" fill="white"/>
              <rect x="14" y="10" width="4" height="6" rx="1" fill="white"/>
              <rect x="22" y="10" width="4" height="6" rx="1" fill="white"/>
              <circle cx="8" cy="26" r="2" fill="#666"/>
              <circle cx="24" cy="26" r="2" fill="#666"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>Bus Price Tracker</h1>
            <span className="tagline">Real-time price monitoring</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-link active">Search</a>
          <a href="#" className="nav-link">My Bookings</a>
          <a href="#" className="nav-link">Alerts</a>
          <a href="#" className="nav-link">Profile</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
