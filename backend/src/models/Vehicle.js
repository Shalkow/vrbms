const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
vehicleNumber: { type: DataTypes.STRING, unique: true },
ownerPhone: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: '',
  validate: { len: [10, 15] },
},
  vehicleNumber: { type: DataTypes.STRING, unique: true },
  fuelType: { type: DataTypes.ENUM('Petrol', 'Diesel', 'CNG', 'Electric'), defaultValue: 'Petrol' },
  transmission: { type: DataTypes.ENUM('Manual', 'Automatic'), defaultValue: 'Manual' },
  seats: { type: DataTypes.INTEGER, defaultValue: 4 },
  luggageCapacity: DataTypes.INTEGER,
  mileage: DataTypes.STRING,
  selfDriveAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  driverIncludedAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
  securityDeposit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  insuranceDetails: DataTypes.STRING,
  rcDetails: DataTypes.STRING,
  pollutionCertificate: DataTypes.STRING,
  features: DataTypes.TEXT, // JSON stringified array
  status: { type: DataTypes.ENUM('available', 'booked', 'maintenance', 'inactive'), defaultValue: 'available' },
  thumbnail: DataTypes.STRING,
}, { tableName: 'vehicles', timestamps: true });

module.exports = Vehicle;
