/**
 * One-time (but safe-to-repeat) startup migration.
 * ------------------------------------------------------------------
 * Older versions of this app used to set vehicle.status = 'booked'
 * whenever a booking was made. That's been removed - availability is
 * now computed live from booking date ranges (see utils/availability.js),
 * and vehicle.status only reflects admin-controlled state (available /
 * maintenance / inactive).
 *
 * Any vehicle rows created before that fix may still be stuck with the
 * old 'booked' value, which silently excludes them from every listing.
 * This migration runs automatically on every server start and:
 *   1. Converts any lingering 'booked' rows back to 'available'
 *   2. Alters the schema so 'booked' is no longer a valid value at all -
 *      making it structurally impossible for this bug to reappear,
 *      regardless of how much data the app grows to.
 *
 * Both steps are idempotent - safe to run on every deploy, forever.
 */
async function repairLegacyVehicleStatus(sequelize) {
  const [[{ count: staleCount }]] = await sequelize.query(
    "SELECT COUNT(*) as count FROM vehicles WHERE status = 'booked'",
  );
  if (Number(staleCount) > 0) {
    await sequelize.query("UPDATE vehicles SET status = 'available' WHERE status = 'booked'");
    console.log(`[migration] Repaired ${staleCount} vehicle(s) stuck with legacy status='booked'.`);
  } else {
    console.log('[migration] No legacy status=\'booked\' vehicles found - nothing to repair.');
  }

  try {
    await sequelize.query(
      "ALTER TABLE vehicles MODIFY status ENUM('available','maintenance','inactive') NOT NULL DEFAULT 'available'",
    );
  } catch (err) {
    // Non-fatal: if this has already run, or the DB dialect doesn't
    // support this exact syntax (e.g. during local sqlite testing),
    // just log and continue - the data cleanup above already happened.
    console.log('[migration] Skipped enum alteration (likely already applied or unsupported dialect):', err.message);
  }
}

module.exports = { repairLegacyVehicleStatus };