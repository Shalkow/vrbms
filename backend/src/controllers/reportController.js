const { Op } = require('sequelize');
const { Booking, Payment, Vehicle, Coupon, CouponUsage } = require('../models');

// GET /api/admin/reports/:type?from=&to=
// Returns raw data; wire to a CSV/PDF/Excel exporter (e.g. exceljs, pdfkit) before go-live.
exports.generate = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { from, to } = req.query;
    const range = {};
    if (from) range[Op.gte] = new Date(from);
    if (to) range[Op.lte] = new Date(to);
    const dateFilter = from || to ? { createdAt: range } : {};

    let data;
    switch (type) {
      case 'revenue':
        data = await Payment.findAll({ where: { status: 'success', ...dateFilter } });
        break;
      case 'bookings':
        data = await Booking.findAll({ where: dateFilter, include: [Vehicle] });
        break;
      case 'vehicle-utilization':
        data = await Vehicle.findAll();
        break;
      case 'coupons':
        data = await CouponUsage.findAll({ where: dateFilter, include: [Coupon] });
        break;
      case 'cancellations':
        data = await Booking.findAll({ where: { status: 'cancelled', ...dateFilter } });
        break;
      default:
        return res.status(400).json({ message: 'Unknown report type' });
    }
    res.json({ type, count: data.length, data });
  } catch (err) { next(err); }
};
