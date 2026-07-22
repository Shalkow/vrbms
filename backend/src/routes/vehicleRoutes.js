const router = require('express').Router();
const ctrl = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/vehicleImageUpload');

router.get('/', ctrl.searchVehicles);
router.get('/:id', ctrl.getVehicle);
router.post('/', protect, authorize('admin'), ctrl.createVehicle);
router.put('/:id', protect, authorize('admin'), ctrl.updateVehicle);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteVehicle);
router.post('/:id/images', protect, authorize('admin'), upload.single('image'), ctrl.addImage);
router.post('/:id/pricing', protect, authorize('admin'), ctrl.setPricing);

module.exports = router;
