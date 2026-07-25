const multer = require('multer');

// Files are kept in memory (not written to local disk) and streamed straight
// to Cloudinary in the controller - local disk on Railway is ephemeral and
// gets wiped on every redeploy, which was silently breaking vehicle images.
const storage = multer.memoryStorage();

const imageFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image/')) return callback(null, true);
  callback(new Error('Only image files can be uploaded'));
};

module.exports = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});