const { Setting } = require('../models');

exports.list = async (req, res, next) => {
  try { res.json(await Setting.findAll()); } catch (err) { next(err); }
};
exports.upsert = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const [setting] = await Setting.findOrCreate({ where: { key }, defaults: { value } });
    await setting.update({ value });
    res.json(setting);
  } catch (err) { next(err); }
};
