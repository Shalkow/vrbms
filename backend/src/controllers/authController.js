const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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

// NOTE: OTP login / Google login / Forgot password are stubbed here.
// Wire OTP via an SMS provider (MSG91/Twilio) and Google via Passport/google-auth-library
// before going live — see README "Modules to extend before production".
exports.otpRequest = async (req, res) => {
  res.status(501).json({ message: 'OTP login not yet implemented - integrate an SMS provider' });
};
exports.googleLogin = async (req, res) => {
  res.status(501).json({ message: 'Google login not yet implemented - integrate google-auth-library' });
};
exports.forgotPassword = async (req, res) => {
  res.status(501).json({ message: 'Forgot password not yet implemented - integrate SMTP + reset token flow' });
};
