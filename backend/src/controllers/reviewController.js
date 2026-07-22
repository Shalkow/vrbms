const { Review } = require('../models');

exports.listForVehicle = async (req, res, next) => {
  try { res.json(await Review.findAll({ where: { vehicleId: req.params.vehicleId } })); } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const review = await Review.create({ vehicleId, rating, comment, userId: req.user.id });
    res.status(201).json(review);
  } catch (err) { next(err); }
};
