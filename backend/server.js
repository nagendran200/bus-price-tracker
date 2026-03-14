import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import cron from 'node-cron';
import { query } from './database/db.js';

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Utility to run queries and return rows
const run = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows;
};

// Routes

// All bus prices with route & bus info
app.get('/api/bus-prices', async (req, res) => {
  try {
    const rows = await run(`
      SELECT 
        bp.*,
        r.route_name, r.origin, r.destination, r.distance,
        b.bus_number, b.operator, b.bus_type, b.total_seats, b.amenities
      FROM bus_prices bp
      JOIN routes r ON bp.route_id = r.id
      JOIN buses b ON bp.bus_id = b.id
      ORDER BY bp.departure_time ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/bus-prices error:', err);
    res.status(500).json({ error: 'Failed to fetch bus prices' });
  }
});

// Bus prices filtered by origin & destination
app.get('/api/bus-prices/route/:origin/:destination', async (req, res) => {
  try {
    const { origin, destination } = req.params;
    const rows = await run(
      `
      SELECT 
        bp.*,
        r.route_name, r.origin, r.destination, r.distance,
        b.bus_number, b.operator, b.bus_type, b.total_seats, b.amenities
      FROM bus_prices bp
      JOIN routes r ON bp.route_id = r.id
      JOIN buses b ON bp.bus_id = b.id
      WHERE r.origin = $1 AND r.destination = $2
      ORDER BY bp.departure_time ASC
    `,
      [origin, destination]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/bus-prices/route error:', err);
    res.status(500).json({ error: 'Failed to fetch bus prices by route' });
  }
});

// Price history for a bus_price entry
app.get('/api/price-history/:busPriceId', async (req, res) => {
  try {
    const { busPriceId } = req.params;
    const rows = await run(
      'SELECT * FROM price_history WHERE bus_price_id = $1 ORDER BY recorded_at DESC',
      [busPriceId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/price-history error:', err);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real-time price update simulation
const updatePricesRandomly = async () => {
  try {
    const busPrices = await run('SELECT * FROM bus_prices');
    if (!busPrices.length) return;

    const idx = Math.floor(Math.random() * busPrices.length);
    const bp = busPrices[idx];

    const changePercent = (Math.random() * 25 - 10) / 100; // -10% .. +15%
    const newPrice = Number((bp.current_price * (1 + changePercent)).toFixed(2));

    let trend = 'stable';
    if (newPrice > bp.current_price) trend = 'up';
    else if (newPrice < bp.current_price) trend = 'down';

    await query(
      'UPDATE bus_prices SET current_price = $1, price_trend = $2, last_updated = NOW() WHERE id = $3',
      [newPrice, trend, bp.id]
    );

    const changePercentage =
      bp.current_price > 0 ? Number(((newPrice - bp.current_price) / bp.current_price * 100).toFixed(2)) : null;

    await query(
      'INSERT INTO price_history (bus_price_id, old_price, new_price, change_percentage) VALUES ($1, $2, $3, $4)',
      [bp.id, bp.current_price, newPrice, changePercentage]
    );

    const [updated] = await run(
      `SELECT bp.*, r.route_name, r.origin, r.destination, b.operator, b.bus_type
       FROM bus_prices bp
       JOIN routes r ON bp.route_id = r.id
       JOIN buses b ON bp.bus_id = b.id
       WHERE bp.id = $1`,
      [bp.id]
    );

    io.emit('priceUpdate', updated);
    console.log(`Price updated (id=${bp.id}): ${bp.current_price} -> ${newPrice}`);
  } catch (err) {
    console.error('updatePricesRandomly error:', err);
  }
};

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

// Schedule updates every 10 seconds
cron.schedule('*/10 * * * * *', updatePricesRandomly);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
