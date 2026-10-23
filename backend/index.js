const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { logApiTraffic } = require('./middleware/apiLogger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const systemRoutes = require('./routes/system');
const filesRoutes = require('./routes/files');
const internalsRoutes = require('./routes/internals');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom live traffic logger + morgan dev
app.use(logApiTraffic);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/internals', internalsRoutes);

// Serve frontend static assets from ../frontend and public/
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Fallback 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`?? SlotSync Server running on http://localhost:${PORT}`);
    console.log(`?? Live API Documentation & Tester: http://localhost:${PORT}/api-docs.html`);
    console.log(`?? Web Application: http://localhost:${PORT}`);
    console.log('====================================================');
  });
});
