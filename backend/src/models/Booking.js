const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingCode: { type: DataTypes.STRING, unique: true, allowNull: false },
  pickupDateTime: { type: DataTypes.DATE, allowNull: false },
  returnDateTime: { type: DataTypes.DATE, allowNull: false },
  rentalType: { type: DataTypes.ENUM('self_drive', 'driver_included'), defaultValue: 'self_drive' },
  distanceKm: DataTypes.DECIMAL(10, 2),
  baseAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  taxAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  cancellationReason: DataTypes.STRING,
}, { tableName: 'bookings', timestamps: true });

module.exports = Booking;
