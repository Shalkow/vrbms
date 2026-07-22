const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  pdfUrl: DataTypes.STRING,
}, { tableName: 'invoices', timestamps: true });

module.exports = Invoice;
