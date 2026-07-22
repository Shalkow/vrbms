const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  channel: { type: DataTypes.ENUM('email', 'sms', 'whatsapp'), defaultValue: 'email' },
  type: {
    type: DataTypes.ENUM(
      'booking_confirmation', 'payment_success', 'payment_failed',
      'booking_reminder', 'pickup_reminder', 'return_reminder',
      'cancellation', 'refund'
    ),
    allowNull: false,
  },
  message: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('pending', 'sent', 'failed'), defaultValue: 'pending' },
}, { tableName: 'notifications', timestamps: true });

module.exports = Notification;
