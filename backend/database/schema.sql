-- Bus Price Tracker Database Schema

-- Create database (run separately)
-- CREATE DATABASE bus_price_tracker;

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_name VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
  id SERIAL PRIMARY KEY,
  bus_number VARCHAR(50) NOT NULL UNIQUE,
  operator VARCHAR(255) NOT NULL,
  bus_type VARCHAR(100),
  total_seats INTEGER,
  amenities TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus prices table (for real-time price tracking)
CREATE TABLE IF NOT EXISTS bus_prices (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
  bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  price_trend VARCHAR(20) DEFAULT 'stable',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table (for tracking price changes)
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  bus_price_id INTEGER REFERENCES bus_prices(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  change_percentage DECIMAL(5, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_routes_origin_dest ON routes(origin, destination);
CREATE INDEX idx_bus_prices_route ON bus_prices(route_id);
CREATE INDEX idx_bus_prices_departure ON bus_prices(departure_time);
CREATE INDEX idx_price_history_bus_price ON price_history(bus_price_id);

-- Insert sample data
INSERT INTO routes (route_name, origin, destination, distance) VALUES
('Bangalore-Hyderabad Express', 'Bangalore', 'Hyderabad', 569.5),
('Chennai-Bangalore Super', 'Chennai', 'Bangalore', 346.0),
('Mumbai-Pune Highway', 'Mumbai', 'Pune', 148.5),
('Delhi-Jaipur Route', 'Delhi', 'Jaipur', 280.0);

INSERT INTO buses (bus_number, operator, bus_type, total_seats, amenities) VALUES
('KA-01-AB-1234', 'RedBus Express', 'AC Sleeper', 40, ARRAY['WiFi', 'Charging Point', 'Water']),
('TN-09-CD-5678', 'VRL Travels', 'AC Seater', 45, ARRAY['WiFi', 'Blanket', 'Water']),
('MH-02-EF-9012', 'Orange Travels', 'Non-AC Sleeper', 35, ARRAY['Water', 'Pillow']),
('DL-05-GH-3456', 'IntrCity SmartBus', 'AC Seater', 50, ARRAY['WiFi', 'Charging Point', 'Snacks']);

INSERT INTO bus_prices (route_id, bus_id, departure_time, arrival_time, base_price, current_price, available_seats, price_trend) VALUES
(1, 1, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '10 hours', 800.00, 850.00, 28, 'up'),
(2, 2, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '9 hours', 600.00, 580.00, 35, 'down'),
(3, 3, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', 400.00, 400.00, 20, 'stable'),
(4, 4, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '10 hours', 700.00, 720.00, 42, 'up');
