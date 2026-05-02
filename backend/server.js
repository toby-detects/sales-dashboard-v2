require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const forecastRoutes = require('./routes/forecast');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const { initSocket } = require('./sockets/salesSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Attach io to req so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

initSocket(io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
