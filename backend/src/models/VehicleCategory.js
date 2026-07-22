const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VehicleCategory = sequelize.define('VehicleCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Car, Bike, Winger, Bus, Tempo Traveller...
  description: DataTypes.TEXT,
  icon: DataTypes.STRING,
}, { tableName: 'vehicle_categories', timestamps: true });

module.exports = VehicleCategory;
