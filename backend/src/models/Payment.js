const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gateway: { type: DataTypes.ENUM('razorpay', 'stripe', 'cashfree', 'cash'), defaultValue: 'razorpay' },
  method: { type: DataTypes.ENUM('upi', 'debit_card', 'credit_card', 'net_banking', 'wallet', 'cash'), allowNull: true },
  transactionId: DataTypes.STRING,
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'), defaultValue: 'pending' },
  refundStatus: { type: DataTypes.ENUM('none', 'initiated', 'completed'), defaultValue: 'none' },
}, { tableName: 'payments', timestamps: true });

module.exports = Payment;
