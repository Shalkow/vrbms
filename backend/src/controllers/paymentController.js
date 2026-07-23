const { v4: uuidv4 } = require('uuid');
const { Payment, Booking, Invoice, Notification, User, Vehicle } = require('../models');
const { sendBookingConfirmationMessages } = require('../utils/whatsapp');

/**
 * PAYMENT GATEWAY INTEGRATION POINT
 * This controller is wired to demonstrate the booking->payment->invoice flow
 * with a mock/dummy gateway response so the whole system runs end-to-end locally.
 *
 * Before going live, replace initiatePayment/verifyPayment with real calls to
 * Razorpay/Stripe/Cashfree SDKs using the keys in .env (RAZORPAY_KEY_ID, etc).
 * See README.md -> "Payment Gateway Go-Live" for the exact steps.
 */

// POST /api/payments/initiate
exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, method, gateway = 'razorpay' } = req.body;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    // --- Replace this block with real gateway order creation, e.g.:
    // const order = await razorpay.orders.create({ amount: booking.totalAmount * 100, currency: 'INR' });
    const mockOrderId = 'order_' + uuidv4().split('-')[0];

    const payment = await Payment.create({
      bookingId,
      gateway,
      method,
      amount: booking.totalAmount,
      status: 'pending',
      transactionId: mockOrderId,
    });

    res.status(201).json({
      payment,
      // Frontend would use this to open the gateway's checkout widget
      gatewayOrderId: mockOrderId,
      amount: booking.totalAmount,
      currency: 'INR',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify  (called after gateway checkout completes / via webhook)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, success = true } = req.body;
    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // --- Replace with real signature verification for the chosen gateway before go-live ---

    await payment.update({ status: success ? 'success' : 'failed' });

    const booking = await Booking.findByPk(payment.bookingId);
    if (success) {
      await booking.update({ status: 'confirmed' });

      const invoice = await Invoice.create({
        bookingId: booking.id,
        invoiceNumber: 'INV-' + uuidv4().split('-')[0].toUpperCase(),
        amount: booking.totalAmount,
      });

      await Notification.create({
  userId: booking.userId,
  channel: 'email',
  type: 'booking_confirmation',
  message: `Your booking ${booking.bookingCode} is confirmed.`,
  status: 'pending',
});

const [customer, vehicle] = await Promise.all([
  User.findByPk(booking.userId),
  Vehicle.findByPk(booking.vehicleId),
]);
sendBookingConfirmationMessages({ booking, vehicle, customer }).catch((err) =>
  console.error('[whatsapp] Booking confirmation dispatch failed:', err.message)
);

return res.json({ payment, booking, invoice });
    }

    await Notification.create({
      userId: booking.userId,
      channel: 'email',
      type: 'payment_failed',
      message: `Payment for booking ${booking.bookingCode} failed. Please try again.`,
      status: 'pending',
    });

    res.json({ payment, booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:bookingId
exports.getPaymentForBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ where: { bookingId: req.params.bookingId } });
    if (!payment) return res.status(404).json({ message: 'No payment found for this booking' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/payments/:id/refund (admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // --- Replace with real gateway refund API call before go-live ---
    await payment.update({ status: 'refunded', refundStatus: 'completed' });

    const booking = await Booking.findByPk(payment.bookingId);
    if (booking) await booking.update({ status: 'refunded' });

    res.json(payment);
  } catch (err) {
    next(err);
  }
};
