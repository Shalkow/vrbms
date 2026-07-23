const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/quote', protect, ctrl.getQuote);
router.post('/', protect, ctrl.createBooking);
router.get('/my', protect, ctrl.myBookings);
router.get('/:id', protect, ctrl.getBooking);


module.exports = router;
