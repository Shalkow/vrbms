const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.me);
router.post('/otp-request', ctrl.otpRequest);
router.post('/google', ctrl.googleLogin);
router.post('/forgot-password', ctrl.forgotPassword);

module.exports = router;
