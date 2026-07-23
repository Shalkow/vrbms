require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, User, VehicleCategory, Location, Vehicle, VehiclePricing, VehicleImage, CmsPage,
} = require('../models');

async function seed() {
  await sequelize.sync({ alter: true });

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await User.findOrCreate({
    where: { email: 'admin@vrbms.com' },
    defaults: { name: 'Super Admin', email: 'admin@vrbms.com', phone: '7972360488', password: adminPassword, role: 'admin' },
  });

  // Categories
  const categoryNames = ['Car', 'Bike', 'Winger', 'Bus', 'Tempo Traveller', 'Luxury Vehicle'];
  const categories = {};
  for (const name of categoryNames) {
    const [cat] = await VehicleCategory.findOrCreate({ where: { name } });
    categories[name] = cat;
  }

  // Locations
  const [nashik] = await Location.findOrCreate({
    where: { city: 'Nashik', branchName: 'Nashik Main Branch' },
    defaults: { address: 'College Road, Nashik', latitude: 19.9975, longitude: 73.7898 },
  });
  const [pune] = await Location.findOrCreate({
    where: { city: 'Pune', branchName: 'Pune Branch' },
    defaults: { address: 'Shivaji Nagar, Pune', latitude: 18.5308, longitude: 73.8474 },
  });

  // Sample vehicle
  const [swift] = await Vehicle.findOrCreate({
    where: { vehicleNumber: 'MH15AB1234' },
    defaults: {
      name: 'Maruti Suzuki Swift',
      ownerPhone: '7972360488',
      categoryId: categories['Car'].id,
      locationId: nashik.id,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: 5,
      luggageCapacity: 2,
      mileage: '20 km/l',
      selfDriveAvailable: true,
      driverIncludedAvailable: true,
      securityDeposit: 3000,
      features: JSON.stringify(['AC', 'Music System', 'Power Steering']),
      status: 'available',
    },
  });

  await VehicleImage.findOrCreate({
    where: { vehicleId: swift.id, isPrimary: true },
    defaults: { imageUrl: 'https://placehold.co/600x400?text=Swift', isPrimary: true },
  });

  await VehiclePricing.findOrCreate({
    where: { vehicleId: swift.id, pricingType: 'daily' },
    defaults: { vehicleId: swift.id, pricingType: 'daily', dailyRate: 2000, isActive: true },
  });

  // CMS pages
  const pages = [
    { slug: 'about-us', title: 'About Us', content: 'We provide reliable vehicle rental services.' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: 'Your privacy matters to us.' },
    { slug: 'terms', title: 'Terms & Conditions', content: 'Standard rental terms apply.' },
    { slug: 'faq', title: 'FAQ', content: 'Frequently asked questions.' },
    {
      slug: 'contact-us',
      title: 'Contact Us',
      content: 'Phone: 7972360488\nEmail: bharatchawan06@gmail.com',
    },
  ];
  for (const p of pages) {
    await CmsPage.findOrCreate({ where: { slug: p.slug }, defaults: p });
  }

  console.log('Seed complete. Admin login: admin@vrbms.com / Admin@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
