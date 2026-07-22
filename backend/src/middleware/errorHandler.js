// Central error handler - keep stack traces out of production responses
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'A coupon with this code already exists' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors.map((error) => error.message).join(', ') });
  }
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
