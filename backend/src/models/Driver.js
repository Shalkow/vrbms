const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  licenseNumber: { type: DataTypes.STRING, allowNull: false },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 5.0 },
}, { tableName: 'drivers', timestamps: true });

module.exports = Driver;
