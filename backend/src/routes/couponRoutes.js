const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Public: validate a coupon is not exposed here on purpose - validation happens via /api/bookings/quote
router.get('/', protect, authorize('admin'), ctrl.listCoupons);
router.post('/', protect, authorize('admin'), ctrl.createCoupon);
router.put('/:id', protect, authorize('admin'), ctrl.updateCoupon);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteCoupon);

module.exports = router;
