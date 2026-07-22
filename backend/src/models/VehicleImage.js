const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VehicleImage = sequelize.define('VehicleImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'vehicle_images', timestamps: true });

module.exports = VehicleImage;
