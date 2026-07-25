const { Op } = require('sequelize');
const { Vehicle, VehicleCategory, VehicleImage, VehiclePricing, Location, Review, Booking } = require('../models');
const { isVehicleAvailableForRange } = require('../utils/availability');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// GET /api/vehicles  (search + filter + sort)
exports.searchVehicles = async (req, res, next) => {
  try {
    const {
      categoryId, locationId, fuelType, transmission, minSeats,
      minPrice, maxPrice, sort, page = 1, limit = 12, includeInactive,
      pickupDateTime, returnDateTime,
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
        const rate = v.VehiclePricings?.[0]?.dailyRate;
        if (rate == null) return true;
        if (minPrice && rate < minPrice) return false;
        if (maxPrice && rate > maxPrice) return false;
        return true;
      });
    }

    // Optional date-range availability filter: only applied when both dates are
    // given (e.g. from a "search available vehicles for these dates" form).
    // Without dates, all admin-available vehicles are returned as before.
    if (pickupDateTime && returnDateTime) {
      const availabilityChecks = await Promise.all(
        rows.map((v) => isVehicleAvailableForRange(Booking, { vehicleId: v.id, pickupDateTime, returnDateTime })),
      );
      rows = rows.filter((_, index) => availabilityChecks[index]);
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

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'vrbms/vehicles' },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
}

// POST /api/vehicles/:id/images (admin)
exports.addImage = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          message: 'Image storage is not configured yet. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        });
      }
      const uploaded = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = uploaded.secure_url;
    }
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

// GET /api/vehicles/:id/availability?pickupDateTime=...&returnDateTime=...
// Lightweight check used by the booking flow to warn the customer immediately
// if a vehicle is already booked for their chosen dates, before they go
// through coupon/pricing steps.
exports.checkAvailability = async (req, res, next) => {
  try {
    const { pickupDateTime, returnDateTime } = req.query;
    if (!pickupDateTime || !returnDateTime) {
      return res.status(400).json({ message: 'pickupDateTime and returnDateTime are required' });
    }
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.status !== 'available') {
      return res.json({ available: false, reason: 'Vehicle is not currently available' });
    }
    const available = await isVehicleAvailableForRange(Booking, { vehicleId: vehicle.id, pickupDateTime, returnDateTime });
    res.json({ available, reason: available ? null : 'Vehicle is already booked for the selected dates' });
  } catch (err) {
    next(err);
  }
};