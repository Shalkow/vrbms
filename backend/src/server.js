require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminBookingRoutes = require('./routes/adminBookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const driverRoutes = require('./routes/driverRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---- Security & core middleware ----
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Basic rate limiting - tune per-route limits before go-live (e.g. stricter on /auth)
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ---- Health check (use for uptime monitoring) ----
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // For production, replace `sync({ alter: true })` with proper migrations
    // (sequelize-cli) so schema changes are reviewable and reversible.
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Models synced.');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
