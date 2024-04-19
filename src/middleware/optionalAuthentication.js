const jwt = require('jsonwebtoken');

const optionalAuthenticationMiddleware = async (req, res, next) => {
  const token = req.signedCookies.token;
  
  if (!token) {
    return next(); 
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId };
  } catch (err) {
    console.log(`Optional authentication attempt failed: ${err.message}`);
    req.isAuthAttemptedButFailed = true;
  }
  next();
};

module.exports = optionalAuthenticationMiddleware;
