const { Coupon } = require('../models');

const optionalNumber = (value) => (value === '' || value === undefined ? null : value);

const prepareCoupon = (body) => ({
  ...body,
  code: body.code?.trim().toUpperCase(),
  usageLimit: optionalNumber(body.usageLimit),
  minBookingAmount: optionalNumber(body.minBookingAmount) ?? 0,
  maxDiscount: optionalNumber(body.maxDiscount),
  expiryDate: body.expiryDate || null,
});

exports.listCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (err) { next(err); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(prepareCoupon(req.body));
    res.status(201).json(coupon);
  } catch (err) { next(err); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.update(prepareCoupon(req.body));
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
