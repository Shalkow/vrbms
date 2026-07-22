const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const settingsCtrl = require('../controllers/settingsController');
const reportCtrl = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', ctrl.dashboard);
router.get('/customers', ctrl.listCustomers);
router.patch('/customers/:id/block', ctrl.toggleBlockCustomer);
router.get('/settings', settingsCtrl.list);
router.post('/settings', settingsCtrl.upsert);
router.get('/reports/:type', reportCtrl.generate);

module.exports = router;
