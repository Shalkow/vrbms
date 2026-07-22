/**
 * Pricing Engine
 * Supports: daily, hourly, per_km, base_plus_km, and season multipliers.
 * Given a vehicle's active VehiclePricing rows + booking duration/distance,
 * returns a breakdown the booking controller can persist.
 */

function hoursBetween(start, end) {
  return Math.max(1, (new Date(end) - new Date(start)) / (1000 * 60 * 60));
}

function daysBetween(start, end) {
  const hours = hoursBetween(start, end);
  return Math.max(1, Math.ceil(hours / 24));
}

function isDateInSeasonWindow(date, pricing) {
  if (!pricing.validFrom || !pricing.validTo) return false;
  const d = new Date(date).setHours(0, 0, 0, 0);
  return d >= new Date(pricing.validFrom).getTime() && d <= new Date(pricing.validTo).getTime();
}

/**
 * @param {Array} pricingRows - VehiclePricing records for the vehicle (isActive: true)
 * @param {Object} params - { pickupDateTime, returnDateTime, distanceKm, rentalType }
 * @returns {Object} { baseAmount, breakdown: [{label, amount}], appliedPricingType }
 */
function calculatePrice(pricingRows, { pickupDateTime, returnDateTime, distanceKm = 0 }) {
  if (!pricingRows || pricingRows.length === 0) {
    throw new Error('No active pricing configured for this vehicle');
  }

  // Priority: base_plus_km > per_km > hourly > daily (admin can configure whichever applies)
  const byType = (type) => pricingRows.find((p) => p.pricingType === type);
  const breakdown = [];
  let baseAmount = 0;
  let appliedPricingType = null;

  const basePlusKm = byType('base_plus_km');
  const perKm = byType('per_km');
  const hourly = byType('hourly');
  const daily = byType('daily');

  if (basePlusKm) {
    appliedPricingType = 'base_plus_km';
    baseAmount += Number(basePlusKm.basePrice || 0);
    breakdown.push({ label: `Base price (includes ${basePlusKm.includedKm || 0} km)`, amount: Number(basePlusKm.basePrice || 0) });

    const extraKm = Math.max(0, distanceKm - (basePlusKm.includedKm || 0));
    if (extraKm > 0) {
      const extraCharge = extraKm * Number(basePlusKm.extraKmRate || 0);
      baseAmount += extraCharge;
      breakdown.push({ label: `Extra distance (${extraKm.toFixed(1)} km @ ₹${basePlusKm.extraKmRate}/km)`, amount: extraCharge });
    }
  } else if (perKm) {
    appliedPricingType = 'per_km';
    const charge = distanceKm * Number(perKm.perKmRate || 0);
    baseAmount += charge;
    breakdown.push({ label: `Distance (${distanceKm.toFixed(1)} km @ ₹${perKm.perKmRate}/km)`, amount: charge });
  } else if (hourly) {
    appliedPricingType = 'hourly';
    const hours = hoursBetween(pickupDateTime, returnDateTime);
    const charge = hours * Number(hourly.hourlyRate || 0);
    baseAmount += charge;
    breakdown.push({ label: `Rental (${hours.toFixed(1)} hrs @ ₹${hourly.hourlyRate}/hr)`, amount: charge });
  } else if (daily) {
    appliedPricingType = 'daily';
    const days = daysBetween(pickupDateTime, returnDateTime);
    const charge = days * Number(daily.dailyRate || 0);
    baseAmount += charge;
    breakdown.push({ label: `Rental (${days} day(s) @ ₹${daily.dailyRate}/day)`, amount: charge });
  } else {
    throw new Error('No compatible pricing rule found for this vehicle');
  }

  // Apply season multiplier if an active "season" pricing row's date window covers the pickup date
  const seasonRows = pricingRows.filter((p) => p.pricingType === 'season');
  for (const season of seasonRows) {
    if (isDateInSeasonWindow(pickupDateTime, season)) {
      const multiplier = Number(season.seasonMultiplier || 1);
      const seasonSurcharge = baseAmount * (multiplier - 1);
      if (seasonSurcharge !== 0) {
        baseAmount += seasonSurcharge;
        breakdown.push({ label: `${season.seasonName || 'Season'} surcharge (x${multiplier})`, amount: seasonSurcharge });
      }
    }
  }

  return { baseAmount: Math.round(baseAmount * 100) / 100, breakdown, appliedPricingType };
}

/**
 * Applies a coupon to a base amount. Returns { discountAmount, error }.
 */
function applyCoupon(coupon, baseAmount) {
  if (!coupon || !coupon.isActive) return { discountAmount: 0, error: 'Coupon is not active' };
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { discountAmount: 0, error: 'Coupon has expired' };
  }
  if (coupon.minBookingAmount && baseAmount < Number(coupon.minBookingAmount)) {
    return { discountAmount: 0, error: `Minimum booking amount of ₹${coupon.minBookingAmount} required` };
  }

  let discount = coupon.discountType === 'percentage'
    ? baseAmount * (Number(coupon.discountValue) / 100)
    : Number(coupon.discountValue);

  if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  discount = Math.min(discount, baseAmount);

  return { discountAmount: Math.round(discount * 100) / 100, error: null };
}

module.exports = { calculatePrice, applyCoupon, hoursBetween, daysBetween };
