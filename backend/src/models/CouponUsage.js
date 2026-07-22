const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CouponUsage = sequelize.define('CouponUsage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'coupon_usage', timestamps: true });

module.exports = CouponUsage;
