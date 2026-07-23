/**
 * WhatsApp notification utility (Meta WhatsApp Cloud API)
 * ------------------------------------------------------------------
 * Sends booking confirmations via a pre-approved WhatsApp message
 * template (business-initiated messages require an approved template
 * unless the customer messaged you within the last 24 hours).
 *
 * Required env vars (Railway -> Variables):
 *   WHATSAPP_API_URL          e.g. https://graph.facebook.com/v20.0
 *   WHATSAPP_PHONE_NUMBER_ID  from Meta -> WhatsApp -> API Setup
 *   WHATSAPP_API_TOKEN        permanent access token (System User)
 *   WHATSAPP_TEMPLATE_NAME    e.g. booking_confirmation
 *
 * If these aren't set, this falls back to logging a mock message instead
 * of throwing, so the booking/payment flow never breaks in local dev.
 */

const { Notification } = require('../models');

function isConfigured() {
  return !!(
    process.env.WHATSAPP_API_URL
    && process.env.WHATSAPP_PHONE_NUMBER_ID
    && process.env.WHATSAPP_API_TOKEN
    && process.env.WHATSAPP_TEMPLATE_NAME
  );
}

// Meta requires E.164 format, digits only (no "+", spaces, or dashes).
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, '');
  // If a 10-digit Indian number came in without a country code, assume +91.
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Sends a WhatsApp template message via the Meta Cloud API.
 * @param {string} toPhone - customer's phone number (any format; will be normalized)
 * @param {string[]} templateParams - values to fill the template's {{1}}, {{2}}, {{3}}... placeholders, in order
 */
async function dispatchWhatsappTemplate(toPhone, templateParams) {
  const normalizedPhone = normalizePhone(toPhone);

  if (!isConfigured()) {
    console.log(`[whatsapp] (mock) would send to ${normalizedPhone || 'unknown number'} with params: ${JSON.stringify(templateParams)}`);
    return { status: 'skipped', reason: 'WhatsApp env vars not fully configured' };
  }

  if (!normalizedPhone) {
    console.warn('[whatsapp] Skipping send: customer has no phone number on file');
    return { status: 'skipped', reason: 'No phone number for customer' };
  }

  const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizedPhone,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE_NAME,
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: templateParams.map((text) => ({ type: 'text', text: String(text) })),
          },
        ],
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || `WhatsApp API error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return { status: 'sent', providerResponse: data };
}

/**
 * Sends a booking confirmation message to the customer via WhatsApp, and
 * records it in the notifications table.
 * @param {Object} params
 * @param {Object} params.booking - Booking instance
 * @param {Object} params.vehicle - Vehicle instance
 * @param {Object} params.customer - User instance (the customer)
 */
async function sendBookingConfirmationMessages({ booking, vehicle, customer }) {
  const vehicleName = vehicle?.name || 'your vehicle';
  const bookingCode = booking?.bookingCode || booking?.id;
  const customerName = customer?.name || 'there';
  const pickupDate = booking?.pickupDateTime
    ? new Date(booking.pickupDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Order must match the template's {{1}}, {{2}}, {{3}} placeholders exactly:
  // {{1}} = customer name, {{2}} = booking/order number, {{3}} = date
  const templateParams = [customerName, String(bookingCode), pickupDate];
  const humanReadableMessage = `Hi ${customerName}, your booking (${bookingCode}) for ${vehicleName} is confirmed. Thank you for choosing us!`;

  let result;
  try {
    result = await dispatchWhatsappTemplate(customer?.phone, templateParams);
  } catch (err) {
    console.error('[whatsapp] Failed to send booking confirmation:', err.message);
    result = { status: 'failed', reason: err.message };
  }

  await Notification.create({
    userId: customer?.id || booking?.userId,
    channel: 'whatsapp',
    type: 'booking_confirmation',
    message: humanReadableMessage,
    status: result.status === 'sent' ? 'sent' : (result.status === 'failed' ? 'failed' : 'pending'),
  });

  return result;
}

module.exports = { sendBookingConfirmationMessages, dispatchWhatsappTemplate };