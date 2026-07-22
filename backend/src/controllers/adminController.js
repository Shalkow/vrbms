const { Op, fn, col, literal } = require('sequelize');
const { Booking, Payment, Vehicle, User } = require('../models');

// GET /api/admin/dashboard
exports.dashboard = async (req, res, next) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const [todaysBookings, monthlyRevenueResult, pendingPayments, vehiclesAvailable, vehiclesUnderMaintenance, recentBookings] = await Promise.all([
      Booking.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      Payment.sum('amount', { where: { status: 'success', createdAt: { [Op.gte]: startOfMonth } } }),
      Payment.count({ where: { status: 'pending' } }),
      Vehicle.count({ where: { status: 'available' } }),
      Vehicle.count({ where: { status: 'maintenance' } }),
      Booking.findAll({ limit: 10, order: [['createdAt', 'DESC']], include: [Vehicle, User] }),
    ]);

    res.json({
      todaysBookings,
      monthlyRevenue: monthlyRevenueResult || 0,
      pendingPayments,
      vehiclesAvailable,
      vehiclesUnderMaintenance,
      recentBookings,
    });
  } catch (err) { next(err); }
};

// GET /api/admin/customers
exports.listCustomers = async (req, res, next) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(customers);
  } catch (err) { next(err); }
};

// PATCH /api/admin/customers/:id/block
exports.toggleBlockCustomer = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    await user.update({ isBlocked: !user.isBlocked });
    res.json(user);
  } catch (err) { next(err); }
};
