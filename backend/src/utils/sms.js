/**
 * SMS utility (OTP delivery)
 * ------------------------------------------------------------------
 * NOTE: This is intentionally a mock/dummy sender for now (per the
 * project's request - real SIM/provider setup is planned before launch).
 * It logs the OTP to the server console instead of sending a real SMS,
 * so the login flow can be built and tested end-to-end today.
 *
 * Before going live, replace `dispatchSms` below with a real call to
 * an SMS provider. For India specifically, sending SMS requires DLT
 * (TRAI) registration regardless of provider - budget time for that
 * separately. Common choices: MSG91, Twilio.
 * Required env vars, once you wire a real provider:
 *   SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID
 */

function isConfigured() {
  return !!(process.env.SMS_API_URL && process.env.SMS_API_KEY);
}

async function dispatchSms(toPhone, message) {
  if (!isConfigured()) {
    console.log(`[sms] (mock) would send to ${toPhone}: ${message}`);
    return { status: 'skipped', reason: 'SMS provider not configured yet (using mock OTP delivery)' };
  }

  // Example real integration (generic REST provider) - uncomment and adjust
  // once you have a real SMS_API_URL / SMS_API_KEY from your provider:
  // const response = await fetch(process.env.SMS_API_URL, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to: toPhone, sender: process.env.SMS_SENDER_ID, message }),
  // });
  // if (!response.ok) throw new Error(`SMS API error: ${response.status}`);
  // return response.json();

  console.log(`[sms] (mock) would send to ${toPhone}: ${message}`);
  return { status: 'skipped', reason: 'Real SMS integration not implemented yet' };
}

module.exports = { dispatchSms, isConfigured };