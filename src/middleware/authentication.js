const jwt = require("jsonwebtoken")
const { StatusCodes } = require("http-status-codes")
const { UnauthenticatedError } = require("../errors")
const { generateTokens } = require("../util/generateToken")
const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "You must be logged in to perform this action." })
  }
  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { userId } = payload
    req.user = { userId }
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        // Attempt to refresh the token using a refresh token
        const { accessToken } = await refreshToken(token) // Assuming you have implemented refreshToken function
        req.user = jwt.decode(accessToken)
        req.headers.authorization = `Bearer ${accessToken}`
        next()
      } catch (refreshErr) {
        refreshErr.userMessage = "Session expired, please login again."
        throw refreshErr
      }
    } else {
      throw new UnauthenticatedError("Authentication invalid")
    }
  }
}

module.exports = authenticationMiddleware
