const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  discountType: { type: DataTypes.ENUM('fixed', 'percentage'), defaultValue: 'percentage' },
  discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  expiryDate: DataTypes.DATEONLY,
  usageLimit: DataTypes.INTEGER,
  minBookingAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  maxDiscount: DataTypes.DECIMAL(10, 2),
  applicableVehicleTypes: DataTypes.TEXT, // JSON array of category ids
  applicableLocations: DataTypes.TEXT, // JSON array of location ids
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'coupons', timestamps: true });

module.exports = Coupon;
