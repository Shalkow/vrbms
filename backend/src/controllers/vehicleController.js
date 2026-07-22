const { Op } = require('sequelize');
const { Vehicle, VehicleCategory, VehicleImage, VehiclePricing, Location, Review } = require('../models');

// GET /api/vehicles  (search + filter + sort)
exports.searchVehicles = async (req, res, next) => {
  try {
    const {
      categoryId, locationId, fuelType, transmission, minSeats,
      minPrice, maxPrice, sort, page = 1, limit = 12, includeInactive,
    } = req.query;

    const where = includeInactive === 'true' ? {} : { status: 'available' };
    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.locationId = locationId;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (minSeats) where.seats = { [Op.gte]: minSeats };

    const order = [];
    if (sort === 'newest') order.push(['createdAt', 'DESC']);
    if (sort === 'popular') order.push(['createdAt', 'DESC']); // placeholder for a real popularity metric

    const vehicles = await Vehicle.findAndCountAll({
      where,
      include: [
        { model: VehicleCategory },
        { model: Location },
        { model: VehicleImage },
        { model: VehiclePricing, where: { isActive: true }, required: false },
      ],
      order: order.length ? order : [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    // Optional in-memory price filter (based on dailyRate) since price lives on a related table
    let rows = vehicles.rows;
    if (minPrice || maxPrice) {
      rows = rows.filter((v) => {
        const rate = v.VehiclePricing?.[0]?.dailyRate;
        if (rate == null) return true;
        if (minPrice && rate < minPrice) return false;
        if (maxPrice && rate > maxPrice) return false;
        return true;
      });
    }

    res.json({ total: vehicles.count, page: parseInt(page), results: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: VehicleCategory },
        { model: Location },
        { model: VehicleImage },
        { model: VehiclePricing },
        { model: Review },
      ],
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles (admin)
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicles/:id (admin)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id (admin)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles/:id/images (admin)
exports.addImage = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/vehicles/${req.file.filename}`
      : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ message: 'Select an image to upload' });

    const hasImages = await VehicleImage.count({ where: { vehicleId: vehicle.id } });
    const isPrimary = req.body.isPrimary === 'true' || !hasImages;
    if (isPrimary) await VehicleImage.update({ isPrimary: false }, { where: { vehicleId: vehicle.id } });

    const image = await VehicleImage.create({ vehicleId: vehicle.id, imageUrl, isPrimary });
    if (isPrimary) await vehicle.update({ thumbnail: imageUrl });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles/:id/pricing (admin)
exports.setPricing = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const [pricing, created] = await VehiclePricing.findOrCreate({
      where: { vehicleId: vehicle.id, pricingType: req.body.pricingType },
      defaults: { vehicleId: vehicle.id, ...req.body },
    });
    if (!created) await pricing.update(req.body);
    res.status(created ? 201 : 200).json(pricing);
  } catch (err) {
    next(err);
  }
};
