const { v4: uuidv4 } = require('uuid');
const {
  Booking, BookingItem, Vehicle, VehiclePricing, Coupon, CouponUsage, Location, Driver, Invoice,
} = require('../models');
const { calculatePrice, applyCoupon } = require('../utils/pricingEngine');

const TAX_RATE = 0.05; // 5% - adjust to match local GST/tax rules before go-live

// POST /api/bookings/quote  - Steps 4-7: compute price before payment (no DB write)
exports.getQuote = async (req, res, next) => {
  try {
    const { vehicleId, pickupDateTime, returnDateTime, distanceKm = 0, couponCode } = req.body;

    if (!vehicleId || !pickupDateTime || !returnDateTime) {
      return res.status(400).json({ message: 'vehicleId, pickupDateTime and returnDateTime are required' });
    }
    if (new Date(returnDateTime) <= new Date(pickupDateTime)) {
      return res.status(400).json({ message: 'Return date/time must be after pickup date/time' });
    }

    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [{ model: VehiclePricing, where: { isActive: true }, required: false }],
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'available') return res.status(409).json({ message: 'Vehicle is not currently available' });

    const { baseAmount, breakdown, appliedPricingType } = calculatePrice(vehicle.VehiclePricing, {
      pickupDateTime, returnDateTime, distanceKm,
    });

    let discountAmount = 0;
    let couponError = null;
    if (couponCode) {
      const normalizedCouponCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ where: { code: normalizedCouponCode } });
      if (!coupon) {
        couponError = 'Invalid coupon code';
      } else {
        const result = applyCoupon(coupon, baseAmount);
        discountAmount = result.discountAmount;
        couponError = result.error;
      }
    }

    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = Math.round(taxableAmount * TAX_RATE * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    res.json({
      vehicleId,
      appliedPricingType,
      breakdown,
      baseAmount,
      discountAmount,
      couponError,
      taxAmount,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings  - Steps 8-10: create booking (status: pending, awaiting payment)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      vehicleId, pickupDateTime, returnDateTime, rentalType,
      pickupLocationId, dropLocationId, distanceKm = 0, couponCode, driverId,
    } = req.body;
    const userId = req.user.id;

    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [{ model: VehiclePricing, where: { isActive: true }, required: false }],
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'available') return res.status(409).json({ message: 'Vehicle is not currently available' });

    if (rentalType === 'driver_included' && !vehicle.driverIncludedAvailable) {
      return res.status(400).json({ message: 'This vehicle does not support driver-included rentals' });
    }

    const { baseAmount, breakdown } = calculatePrice(vehicle.VehiclePricing, {
      pickupDateTime, returnDateTime, distanceKm,
    });

    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      const normalizedCouponCode = couponCode.trim().toUpperCase();
      coupon = await Coupon.findOne({ where: { code: normalizedCouponCode } });
      if (coupon) {
        const result = applyCoupon(coupon, baseAmount);
        if (result.error) return res.status(400).json({ message: result.error });
        discountAmount = result.discountAmount;
      } else {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }
    }

    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = Math.round(taxableAmount * TAX_RATE * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const booking = await Booking.create({
      bookingCode: 'BK-' + uuidv4().split('-')[0].toUpperCase(),
      userId,
      vehicleId,
      pickupLocationId,
      dropLocationId,
      pickupDateTime,
      returnDateTime,
      rentalType: rentalType || 'self_drive',
      distanceKm,
      baseAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      couponId: coupon ? coupon.id : null,
      driverId: rentalType === 'driver_included' ? driverId || null : null,
      status: 'pending',
    });

    // Persist price breakdown as booking line items
    await Promise.all(breakdown.map((item) => BookingItem.create({ bookingId: booking.id, ...item })));

    if (coupon) {
      await CouponUsage.create({ couponId: coupon.id, userId, bookingId: booking.id });
    }

    // Mark vehicle as booked (a real system should use date-range availability, not a single status flag)
    await vehicle.update({ status: 'booked' });

    const fullBooking = await Booking.findByPk(booking.id, { include: [BookingItem, Vehicle] });
    res.status(201).json(fullBooking);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my - customer's booking history
exports.myBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [Vehicle, { model: Location, as: 'PickupLocation' }, { model: Location, as: 'DropLocation' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [Vehicle, BookingItem, { model: Location, as: 'PickupLocation' }, { model: Location, as: 'DropLocation' }, Driver],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel - customer cancels (subject to cancellation policy)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: `Booking already ${booking.status}` });
    }

    // TODO: apply real cancellation policy (e.g. % refund based on time-to-pickup) before go-live
    await booking.update({ status: 'cancelled', cancellationReason: req.body.reason || 'Cancelled by customer' });
    const vehicle = await Vehicle.findByPk(booking.vehicleId);
    if (vehicle) await vehicle.update({ status: 'available' });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ---- Admin ----

// GET /api/admin/bookings
exports.adminListBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const bookings = await Booking.findAll({ where, include: [Vehicle], order: [['createdAt', 'DESC']] });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/bookings/:id/status
exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.update({ status });

    if (['completed', 'cancelled'].includes(status)) {
      const vehicle = await Vehicle.findByPk(booking.vehicleId);
      if (vehicle) await vehicle.update({ status: 'available' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/bookings/:id/assign-driver
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.update({ driverId, rentalType: 'driver_included' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
