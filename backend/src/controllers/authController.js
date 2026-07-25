const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, PhoneOtp } = require('../models');
const { dispatchSms, isConfigured: isSmsConfigured } = require('../utils/sms');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between resends
const OTP_MAX_ATTEMPTS = 5;

const normalizePhone = (phone) => (phone || '').replace(/[^\d+]/g, '');
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });

    const token = signToken(user.id, user.role);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: req.user });
};

// NOTE: Google login / Forgot password are still stubbed - see README
// "Modules to extend before production" for how to wire those up.
//
// POST /api/auth/otp-request  { phone }
// Generates and "sends" a 6-digit OTP. SMS delivery is currently mocked
// (see utils/sms.js) - the OTP is logged server-side and, only while the
// SMS provider is unconfigured, also returned in this response so the
// login flow can be tested end-to-end before a real SIM/provider is wired up.
exports.otpRequest = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone || phone.length < 8) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }

    const recent = await PhoneOtp.findOne({
      where: { phone, createdAt: { [Op.gt]: new Date(Date.now() - OTP_RESEND_COOLDOWN_MS) } },
      order: [['createdAt', 'DESC']],
    });
    if (recent) {
      return res.status(429).json({ message: 'Please wait a moment before requesting another code' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    await PhoneOtp.create({ phone, otpHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) });

    const message = `${otp} is your RentingWheels login code. It expires in 5 minutes. Do not share this code.`;
    await dispatchSms(phone, message);

    const response = { message: 'Verification code sent' };
    if (!isSmsConfigured()) {
      // Mock mode only: surface the code directly so you can test login now.
      // This block auto-disables the moment SMS_API_URL/SMS_API_KEY are set.
      response.devOtp = otp;
    }
    res.json(response);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/otp-verify  { phone, otp, name? }
// Verifies the code and logs the user in, creating a new account
// automatically on first-time phone login.
exports.otpVerify = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const { otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and code are required' });

    const record = await PhoneOtp.findOne({
      where: { phone, consumed: false, expiresAt: { [Op.gt]: new Date() } },
      order: [['createdAt', 'DESC']],
    });
    if (!record) return res.status(400).json({ message: 'Code expired or not found. Request a new one.' });
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) {
      await record.update({ attempts: record.attempts + 1 });
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }
    await record.update({ consumed: true });

    let user = await User.findOne({ where: { phone } });
    if (!user) {
      // First-time phone login - auto-register a minimal account. Since email
      // is required/unique in the schema, we use a placeholder derived from
      // the phone; the user can add a real email later from their profile.
      const randomPassword = await bcrypt.hash(`${phone}-${Date.now()}-${Math.random()}`, 10);
      user = await User.create({
        name: name?.trim() || 'New User',
        email: `phone_${phone.replace(/\D/g, '')}@users.rentingwheels.local`,
        phone,
        password: randomPassword,
      });
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' });

    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res) => {
  res.status(501).json({ message: 'Google login not yet implemented - integrate google-auth-library' });
};
exports.forgotPassword = async (req, res) => {
  res.status(501).json({ message: 'Forgot password not yet implemented - integrate SMTP + reset token flow' });
};