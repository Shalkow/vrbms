const { Op } = require('sequelize');

// Booking statuses that actually hold/block a vehicle for its date range.
// 'completed', 'cancelled', 'refunded' bookings no longer occupy the vehicle.
const BLOCKING_STATUSES = ['pending', 'confirmed', 'in_progress'];

/**
 * Returns true if the vehicle has no overlapping active booking for the
 * given [pickupDateTime, returnDateTime) range. Two ranges overlap when
 * existingStart < newEnd AND existingEnd > newStart.
 * @param {import('sequelize').Model} Booking
 * @param {Object} params
 * @param {number} params.vehicleId
 * @param {string|Date} params.pickupDateTime
 * @param {string|Date} params.returnDateTime
 * @param {number} [params.excludeBookingId] - skip this booking (e.g. when re-checking on update)
 */
async function isVehicleAvailableForRange(Booking, { vehicleId, pickupDateTime, returnDateTime, excludeBookingId }) {
  const where = {
    vehicleId,
    status: { [Op.in]: BLOCKING_STATUSES },
    pickupDateTime: { [Op.lt]: returnDateTime },
    returnDateTime: { [Op.gt]: pickupDateTime },
  };
  if (excludeBookingId) {
    where.id = { [Op.ne]: excludeBookingId };
  }
  const conflict = await Booking.findOne({ where });
  return !conflict;
}

module.exports = { isVehicleAvailableForRange, BLOCKING_STATUSES };