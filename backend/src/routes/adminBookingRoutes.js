const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/', ctrl.adminListBookings);
router.patch('/:id/status', ctrl.adminUpdateStatus);
router.patch('/:id/assign-driver', ctrl.assignDriver);

module.exports = router;
