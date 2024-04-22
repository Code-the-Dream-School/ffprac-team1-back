const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authenticationMiddleware = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    return next(new UnauthenticatedError("Authentication invalid"));
  }

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: payload.userId };
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        next(new UnauthenticatedError("Session expired, please login again."));
      } else {
        next(new UnauthenticatedError("Authentication invalid"));
      }
    }
  }
};

module.exports = authenticationMiddleware;
