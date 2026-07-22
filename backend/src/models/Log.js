const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Log = sequelize.define('Log', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING, allowNull: false },
  details: DataTypes.TEXT,
  ipAddress: DataTypes.STRING,
}, { tableName: 'logs', timestamps: true });

module.exports = Log;
