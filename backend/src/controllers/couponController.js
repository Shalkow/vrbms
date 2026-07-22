const { Coupon } = require('../models');

exports.listCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (err) { next(err); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) { next(err); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (err) { next(err); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.destroy();
    res.json({ message: 'Coupon deleted' });
  } catch (err) { next(err); }
};
