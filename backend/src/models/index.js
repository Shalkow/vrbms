const sequelize = require('../config/db');

const User = require('./User');
const VehicleCategory = require('./VehicleCategory');
const Location = require('./Location');
const Vehicle = require('./Vehicle');
const VehicleImage = require('./VehicleImage');
const VehiclePricing = require('./VehiclePricing');
const Booking = require('./Booking');
const BookingItem = require('./BookingItem');
const Payment = require('./Payment');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Driver = require('./Driver');
const Review = require('./Review');
const Notification = require('./Notification');
const Invoice = require('./Invoice');
const CmsPage = require('./CmsPage');
const Setting = require('./Setting');
const Log = require('./Log');

// ---- Vehicle relationships ----
VehicleCategory.hasMany(Vehicle, { foreignKey: 'categoryId' });
Vehicle.belongsTo(VehicleCategory, { foreignKey: 'categoryId' });

Location.hasMany(Vehicle, { foreignKey: 'locationId' });
Vehicle.belongsTo(Location, { foreignKey: 'locationId' });

Vehicle.hasMany(VehicleImage, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
VehicleImage.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(VehiclePricing, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
VehiclePricing.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(Review, { foreignKey: 'vehicleId' });
Review.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// ---- Booking relationships ----
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Location.hasMany(Booking, { as: 'PickupBookings', foreignKey: 'pickupLocationId' });
Booking.belongsTo(Location, { as: 'PickupLocation', foreignKey: 'pickupLocationId' });

Location.hasMany(Booking, { as: 'DropBookings', foreignKey: 'dropLocationId' });
Booking.belongsTo(Location, { as: 'DropLocation', foreignKey: 'dropLocationId' });

Driver.hasMany(Booking, { foreignKey: 'driverId' });
Booking.belongsTo(Driver, { foreignKey: 'driverId' });

Coupon.hasMany(Booking, { foreignKey: 'couponId' });
Booking.belongsTo(Coupon, { foreignKey: 'couponId' });

Booking.hasMany(BookingItem, { foreignKey: 'bookingId', onDelete: 'CASCADE' });
BookingItem.belongsTo(Booking, { foreignKey: 'bookingId' });

Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

Booking.hasOne(Invoice, { foreignKey: 'bookingId' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId' });

// ---- Coupon usage ----
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });
User.hasMany(CouponUsage, { foreignKey: 'userId' });
CouponUsage.belongsTo(User, { foreignKey: 'userId' });

// ---- Notifications & Logs ----
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  VehicleCategory,
  Location,
  Vehicle,
  VehicleImage,
  VehiclePricing,
  Booking,
  BookingItem,
  Payment,
  Coupon,
  CouponUsage,
  Driver,
  Review,
  Notification,
  Invoice,
  CmsPage,
  Setting,
  Log,
};
