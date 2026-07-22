const { Driver } = require('../models');

exports.list = async (req, res, next) => {
  try { res.json(await Driver.findAll()); } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await Driver.create(req.body)); } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const d = await Driver.findByPk(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    await d.update(req.body);
    res.json(d);
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const d = await Driver.findByPk(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    await d.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
