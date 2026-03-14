# Bus Price Tracker - Real-Time Price Monitoring

> A comprehensive real-time bus price tracking application with WebSocket support, built with React 19, Node.js, Express, Socket.io, and PostgreSQL.

## 🚀 Features

- **🔴 Real-Time Price Updates**: Live price tracking with Socket.io WebSocket connections
- **📊 Price History Visualization**: Interactive charts showing historical price trends
- **🔔 Price Drop Alerts**: Automatic notifications when prices drop below thresholds
- **📱 Responsive UI**: Mobile-first design matching Figma specifications
- **🔐 User Authentication**: Secure JWT-based authentication system
- **🎯 Track/Untrack Buses**: Personal watchlist for specific bus routes
- **⚡ Performance Optimized**: Efficient data fetching with 5-minute update intervals

## 🛠 Tech Stack

### Frontend
- React 19 with TypeScript
- Vite (Build tool)
- Tailwind CSS
- Socket.io Client
- Recharts (Data visualization)

### Backend
- Node.js + Express
- TypeScript
- Socket.io Server
- PostgreSQL
- JWT Authentication
- Node-Cron (Scheduled tasks)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

## 🏗 Project Structure

```
bus-price-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & price tracking
│   │   ├── socket/          # WebSocket handlers
│   │   └── server.ts        # Express server entry point
│   ├── database/
│   │   └── schema.sql       # PostgreSQL schema
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── hooks/           # Custom React hooks
    │   ├── services/        # API services
    │   ├── types/           # TypeScript types
    │   └── App.tsx          # Main app component
    ├── package.json
    └── vite.config.ts
```

## 🚦 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/nagendran200/bus-price-tracker.git
cd bus-price-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create PostgreSQL database
createdb bus_price_tracker

# Run database schema
psql bus_price_tracker < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔌 Real-Time Architecture

### Price Update Flow

1. **Cron Job** runs every 5 minutes
2. **Price Service** fetches latest bus prices from data source
3. **Database** stores price history
4. **Socket.io** emits real-time updates to connected clients
5. **Frontend** receives and displays live price changes

### WebSocket Events

- `price_update_{busId}`: Real-time price updates for specific bus
- `price_alert`: Notifications when price drops below threshold
- `connection`: Client connection established
- `disconnect`: Client disconnected

## 📊 Database Schema

### Tables

- **users**: User authentication and profiles
- **buses**: Bus route information
- **price_history**: Time-series price data
- **user_tracking**: User bus watchlists
- **price_alerts**: Alert configurations

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/bus_price_tracker
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

## 🎨 Design Reference

UI design based on Figma: [Bus Price Tracker Design](https://www.figma.com/design/QWh02NPoAdkeIbARmyaYTR/Bus-Price-Tracker)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Buses
- `POST /api/buses/search` - Search buses
- `GET /api/buses/:id` - Get bus details

### Tracking
- `POST /api/tracking/add` - Add bus to watchlist
- `DELETE /api/tracking/:id` - Remove from watchlist
- `GET /api/tracking` - Get tracked buses

### Price History
- `GET /api/price-history/:busId` - Get price history

## 🚀 Deployment

### Backend Deployment (e.g., Railway, Render)

```bash
npm run build
npm start
```

### Frontend Deployment (e.g., Vercel, Netlify)

```bash
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

**Nagendran**
- GitHub: [@nagendran200](https://github.com/nagendran200)

## 🙏 Acknowledgments

- React Team for React 19
- Socket.io for real-time capabilities
- PostgreSQL team
- Tailwind CSS

---

**Built with ❤️ for tracking bus prices in real-time**
