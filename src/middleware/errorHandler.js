const { StatusCodes } = require("http-status-codes");

const MONGO_ERR_DUPLICATE_ENTRY = 5000;

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, please try again later"
  };

  if (err.name === "ValidationError") {
    customError.message = Object.values(err.errors)
      .map(item => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  if (err.code && err.code === MONGO_ERR_DUPLICATE_ENTRY) {
    customError.message = `Duplicate value entered value for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (err.name === "CastError") {
    customError.message = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }
  if (err.name === "TokenExpiredError") {
    customError.message = err.userMessage || "Session expired, please login again";
    customError.statusCode = 401;
  }

  return res.status(customError.statusCode).json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;
