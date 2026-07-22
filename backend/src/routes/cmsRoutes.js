const router = require('express').Router();
const ctrl = require('../controllers/cmsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:slug', ctrl.getPage);
router.get('/', protect, authorize('admin'), ctrl.listAll);
router.post('/', protect, authorize('admin'), ctrl.upsert);

module.exports = router;
