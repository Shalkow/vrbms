const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  city: { type: DataTypes.STRING, allowNull: false },
  branchName: DataTypes.STRING,
  address: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(10, 7),
  longitude: DataTypes.DECIMAL(10, 7),
  isPickup: { type: DataTypes.BOOLEAN, defaultValue: true },
  isDrop: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'locations', timestamps: true });

module.exports = Location;
