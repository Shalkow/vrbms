const { VehicleCategory } = require('../models');

exports.list = async (req, res, next) => {
  try { res.json(await VehicleCategory.findAll()); } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await VehicleCategory.create(req.body)); } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const cat = await VehicleCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Not found' });
    await cat.update(req.body);
    res.json(cat);
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const cat = await VehicleCategory.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Not found' });
    await cat.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
