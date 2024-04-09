const jwt = require("jsonwebtoken")

const attachCookiesToResponse = ({ res, user }) => {
  const secret = process.env.JWT_SECRET
  const jwtLifetime = process.env.JWT_LIFETIME
  const token = jwt.sign({ userId: user._id }, secret, {
    expiresIn: jwtLifetime
  })
  const oneWeek = 1000 * 60 * 60 * 24 * 7;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneWeek),
    secure: process.env.NODE_ENV === "production",
    signed: true
  })
}

module.exports = attachCookiesToResponse
