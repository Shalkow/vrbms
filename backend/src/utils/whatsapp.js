const { Notification } = require('../models');

async function dispatchWhatsappMessage(toPhone, message) {
  if (!process.env.WHATSAPP_API_TOKEN) {
    console.log(`[whatsapp] (mock) would send to ${toPhone || 'unknown number'}: ${message}`);
    return { status: 'skipped', reason: 'WHATSAPP_API_TOKEN not configured' };
  }

  console.log(`[whatsapp] (mock) would send to ${toPhone}: ${message}`);
  return { status: 'skipped', reason: 'Real WhatsApp integration not implemented yet' };
}

async function sendBookingConfirmationMessages({ booking, vehicle, customer }) {
  const vehicleName = vehicle?.name || 'your vehicle';
  const bookingCode = booking?.bookingCode || booking?.id;
  const message = `Hi ${customer?.name || 'there'}, your booking (${bookingCode}) for ${vehicleName} is confirmed. Thank you for choosing us!`;

  const result = await dispatchWhatsappMessage(customer?.phone, message);

  await Notification.create({
    userId: customer?.id || booking?.userId,
    channel: 'whatsapp',
    type: 'booking_confirmation',
    message,
    status: result.status === 'skipped' ? 'pending' : 'sent',
  });

  return result;
}

module.exports = { sendBookingConfirmationMessages, dispatchWhatsappMessage };