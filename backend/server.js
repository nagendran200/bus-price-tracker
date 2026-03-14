import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cron from 'node-cron';
import pool, { query } from './database/db.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all bus prices with route and bus details
app.get('/api/bus-prices', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        bp.id,
        bp.departure_time,
        bp.arrival_time,
        bp.current_price,
        bp.base_price,
        bp.available_seats,
        bp.price_trend,
        r.route_name,
        r.origin,
        r.destination,
        r.distance,
        b.bus_number,
        b.operator,
        b.bus_type,
        b.total_seats,
        b.amenities
      FROM bus_prices bp
      JOIN routes r ON bp.route_id = r.id
      JOIN buses b ON bp.bus_id = b.id
      ORDER BY bp.departure_time ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bus prices:', error);
    res.status(500).json({ error: 'Failed to fetch bus prices' });
  }
});

// Get bus prices by route
app.get('/api/bus-prices/route/:origin/:destination', async (req, res) => {
  try {
    const { origin, destination } = req.params;
    const result = await query(
      `
      SELECT 
        bp.id,
        bp.departure_time,
        bp.arrival_time,
        bp.current_price,
        bp.base_price,
        bp.available_seats,
        bp.price_trend,
        r.route_name,
        r.origin,
        r.destination,
        r.distance,
        b.bus_number,
        b.operator,
        b.bus_type,
        b.total_seats,
        b.amenities
      FROM bus_prices bp
      JOIN routes r ON bp.route_id = r.id
      JOIN buses b ON bp.bus_id = b.id
      WHERE r.origin = $1 AND r.destination = $2
      ORDER BY bp.departure_time ASC
    `,
      [origin, destination]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bus prices by route:', error);
    res.status(500).json({ error: 'Failed to fetch bus prices' });
  }
});

// Get price history for a specific busId', async (req, res) => {
  try {
    const { busPriceId } = req.params;
    const result = await query(
      'SELECT * FROM price_history WHERE bus_price_id = $1 ORDER BY recorded_at DESC',
      [busPriceId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Real-time price update simulation function
const updatePricesRandomly = async () => {
  try {
    // Get all bus prices
    const result = await query('SELECT * FROM bus_prices');
    const busPrices = result.rows;

    // Randomly select a bus price to update
    if (busPrices.length > 0) {
      const randomIndex = Math.floor(Math.random() * busPrices.length);
      const busPrice = busPrices[randomIndex];

      // Calculate new price (random fluctuation between -10% to +15%)
      const changePercent = (Math.random() * 25 - 10) / 100;
      const newPrice = Number((busPrice.current_price * (1 + changePercent)).toFixed(2));
      
      // Determine trend
      let trend = 'stable';
      if (newPrice > busPrice.current_price) trend = 'up';
      else if (newPrice < busPrice.current_price) trend = 'down';

      // Update database
      await query(
        'UPDATE bus_prices SET current_price = $1, price_trend = $2, last_updated = NOW() WHERE id = $3',
        [newPrice, trend, busPrice.id]
      );

      // Record price history
      const changePercentage = ((newPrice - busPrice.current_price) / busPrice.current_price * 100).toFixed(2);
      await query(
        'INSERT INTO price_history (bus_price_id, old_price, new_price, change_percentage) VALUES ($1, $2, $3, $4)',
        [busPrice.id, busPrice.current_price, newPrice, changePercentage]
      );

      // Emit Socket.io event with updated price
      const updatedResult = await query(
        `SELECT bp.*, r.route_name, r.origin, r.destination, b.operator, b.bus_type 
         FROM bus_prices bp 
         JOIN routes r ON bp.route_id = r.id 
         JOIN buses b ON bp.bus_id = b.id 
         WHERE bp.id = $1`,
        [busPrice.id]
      );

      io.emit('priceUpdate', updatedResult.rows[0]);
      console.log(`🔄 Price updated for bus ID ${busPrice.id}: ${busPrice.current_price} → ${newPrice}`);
    }
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔗 New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Schedule price updates every 10 seconds
cron.schedule('*/10 * * * * *', () => {
  updatePricesRandomly();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Real-time price updates enabled`);
});
app.get('/api/price-history/:busPrice
