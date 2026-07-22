const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/initiate', protect, ctrl.initiatePayment);
router.post('/verify', protect, ctrl.verifyPayment);
router.get('/:bookingId', protect, ctrl.getPaymentForBooking);
router.post('/admin/:id/refund', protect, authorize('admin'), ctrl.refundPayment);

module.exports = router;
