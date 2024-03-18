const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(); 
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email } = payload;
    req.user = { userId, email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      err.userMessage = 'Session expired, please login again.';
      throw err;
    } else {
      throw new UnauthenticatedError('Authentication invalid');
    }
  }
};

module.exports = authenticationMiddleware;