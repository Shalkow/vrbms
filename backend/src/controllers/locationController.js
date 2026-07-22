const { Location } = require('../models');

exports.list = async (req, res, next) => {
  try { res.json(await Location.findAll()); } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Location.create(req.body)); } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const loc = await Location.findByPk(req.params.id);
    if (!loc) return res.status(404).json({ message: 'Not found' });
    await loc.update(req.body);
    res.json(loc);
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const loc = await Location.findByPk(req.params.id);
    if (!loc) return res.status(404).json({ message: 'Not found' });
    await loc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// GET /api/locations/distance?fromId=&toId=
// Stub: replace with a real Google Distance Matrix API call before go-live.
exports.distance = async (req, res, next) => {
  try {
    const { fromId, toId } = req.query;
    const from = await Location.findByPk(fromId);
    const to = await Location.findByPk(toId);
    if (!from || !to) return res.status(404).json({ message: 'Location not found' });

    if (!from.latitude || !to.latitude) {
      return res.status(501).json({ message: 'Geo coordinates missing - integrate Google Distance Matrix API for accurate distance' });
    }
    // Haversine formula as a placeholder for straight-line distance
    const R = 6371;
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    res.json({ distanceKm: Math.round(distanceKm * 10) / 10, note: 'Straight-line estimate. Use Google Distance Matrix API for road distance before go-live.' });
  } catch (err) { next(err); }
};
