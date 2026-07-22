const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/vehicle/:vehicleId', ctrl.listForVehicle);
router.post('/', protect, ctrl.create);

module.exports = router;
