const { CmsPage } = require('../models');

exports.getPage = async (req, res, next) => {
  try {
    const page = await CmsPage.findOne({ where: { slug: req.params.slug, isPublished: true } });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) { next(err); }
};
exports.listAll = async (req, res, next) => {
  try { res.json(await CmsPage.findAll()); } catch (err) { next(err); }
};
exports.upsert = async (req, res, next) => {
  try {
    const { slug } = req.body;
    const [page] = await CmsPage.findOrCreate({ where: { slug }, defaults: req.body });
    await page.update(req.body);
    res.json(page);
  } catch (err) { next(err); }
};
