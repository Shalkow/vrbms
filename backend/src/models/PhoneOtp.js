const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Stores a hashed OTP per phone number (never plaintext), with expiry,
// attempt counting (to block brute-force guessing), and resend cooldown.
const PhoneOtp = sequelize.define('PhoneOtp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  otpHash: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  consumed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'phone_otps', timestamps: true });

module.exports = PhoneOtp;