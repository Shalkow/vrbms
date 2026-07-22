const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Supports: daily, hourly, per_km, base_plus_km, season pricing
const VehiclePricing = sequelize.define('VehiclePricing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pricingType: {
    type: DataTypes.ENUM('daily', 'hourly', 'per_km', 'base_plus_km', 'season'),
    defaultValue: 'daily',
  },
  dailyRate: DataTypes.DECIMAL(10, 2),
  hourlyRate: DataTypes.DECIMAL(10, 2),
  perKmRate: DataTypes.DECIMAL(10, 2),
  basePrice: DataTypes.DECIMAL(10, 2),
  includedKm: DataTypes.INTEGER,
  extraKmRate: DataTypes.DECIMAL(10, 2),
  seasonName: DataTypes.STRING, // Weekend, Holiday, Festival, Peak
  seasonMultiplier: DataTypes.DECIMAL(4, 2), // e.g. 1.5x
  validFrom: DataTypes.DATEONLY,
  validTo: DataTypes.DATEONLY,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'vehicle_pricing', timestamps: true });

module.exports = VehiclePricing;
