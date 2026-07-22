const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Line items for a booking (e.g. extra add-ons, extra km charge, driver charge)
const BookingItem = sequelize.define('BookingItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'booking_items', timestamps: true });

module.exports = BookingItem;
