const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '../../uploads/vehicles');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `vehicle-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const imageFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image/')) return callback(null, true);
  callback(new Error('Only image files can be uploaded'));
};

module.exports = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
