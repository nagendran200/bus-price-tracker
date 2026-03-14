import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaBus, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [busPrices, setBusPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch initial bus prices
    fetchBusPrices();

    // Listen for real-time price updates
    socket.on('priceUpdate', (updatedBus) => {
      setBusPrices(prev => 
        prev.map(bus => bus.id === updatedBus.id ? updatedBus : bus)
      );
    });

    return () => {
      socket.off('priceUpdate');
    };
  }, []);

  const fetchBusPrices = async () => {
    try {
      const response = await axios.get('/api/bus-prices');
      setBusPrices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus prices:', error);
      setLoading(false);
    }
  };

  const getPriceTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="trend-up" />;
    if (trend === 'down') return <FaArrowDown className="trend-down" />;
    return <FaMinus className="trend-stable" />;
  };

  const filteredBuses = busPrices.filter(bus => {
    if (filter === 'all') return true;
    return bus.price_trend === filter;
  });

  if (loading) {
    return <div className="loading">Loading bus prices...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <FaBus className="logo" />
          <h1>Bus Price Tracker</h1>
          <p className="subtitle">Real-Time Price Monitoring</p>
        </div>
      </header>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Buses
        </button>
        <button 
          className={filter === 'up' ? 'active' : ''}
          onClick={() => setFilter('up')}
        >
          Price Up
        </button>
        <button 
          className={filter === 'down' ? 'active' : ''}
          onClick={() => setFilter('down')}
        >
          Price Down
        </button>
        <button 
          className={filter === 'stable' ? 'active' : ''}
          onClick={() => setFilter('stable')}
        >
          Stable
        </button>
      </div>

      <div className="bus-list">
        {filteredBuses.map(bus => (
          <div key={bus.id} className="bus-card">
            <div className="bus-header">
              <h3>{bus.operator}</h3>
              <span className="bus-type">{bus.bus_type}</span>
            </div>
            
            <div className="route-info">
              <p className="route">{bus.origin} → {bus.destination}</p>
              <p className="bus-number">{bus.bus_number}</p>
            </div>

            <div className="time-info">
              <span>Departure: {new Date(bus.departure_time).toLocaleTimeString()}</span>
              <span>Arrival: {new Date(bus.arrival_time).toLocaleTimeString()}</span>
            </div>

            <div className="price-section">
              <div className="current-price">
                <span className="price-label">Current Price</span>
                <div className="price-with-trend">
                  <span className="price">₹{bus.current_price}</span>
                  {getPriceTrendIcon(bus.price_trend)}
                </div>
              </div>
              <div className="base-price">
                <span>Base: ₹{bus.base_price}</span>
              </div>
            </div>

            <div className="seats-info">
              <span className={`seats ${bus.available_seats < 10 ? 'low' : ''}`}>
                {bus.available_seats}/{bus.total_seats} seats available
              </span>
            </div>

            {bus.amenities && (
              <div className="amenities">
                {bus.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
