const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()
const { StatusCodes } = require("http-status-codes")
const { BadRequestError, UnauthenticatedError } = require("../errors")
const User = require("../models/User.js")
const generateToken = require("../util/generateToken")
const attachCookiesToResponse = require("../util/attachCookiesToResponse")
const registerUser = async (req, res) => {
  try {
    console.log("Request Body:", req.body)
    const { email, password, firstName, lastName } = req.body

    // check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new BadRequestError("User already exists.")
    }

    // Create a new user
    const newUser = new User({ email, password, firstName, lastName })
    await newUser.save()
    console.log("User registered:", newUser)

    // Generate token
    const token = generateToken(newUser._id)
    // Attach cookies to the response
    attachCookiesToResponse({ res, user: newUser })

    res
      .status(StatusCodes.OK)
      .json({ message: "User registered successfully", token })
  } catch (error) {
    console.error("Error registering user:", error)
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const errorMessage = error.message || "Error registering user"
    res.status(statusCode).json({ error: errorMessage })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new BadRequestError("Please provide email and password")
    }

    const user = await User.findOne({ email })
    if (!user) {
      throw new UnauthenticatedError("Invalid email")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthenticatedError("Invalid password")
    }

    // Attach cookies to the response
    attachCookiesToResponse({ res, user })

    res.status(StatusCodes.OK).json({
      message: "Logged in successful",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        id: user._id,
      }
    })
  } catch (error) {
    console.error("Error logging in:", error)
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const errorMessage = error.message || "Error logging in"
    res.status(statusCode).json({ error: errorMessage })
  }
}

const logoutUser = (req, res) => {
  try {
    // Clear the 'token' cookie or session
    res.clearCookie("token", {
      httpOnly: true,
      expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({ message: "Logged out successfully" })
  } catch (err) {
    console.error("Error during logout:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Logout failed" })
  }
}

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    // check if user with the provided email exists
    const user = await User.findOne({ email })
    if (!user) {
      throw new BadRequestError("User not found.")
    }

    // generate password reset token and expiration time
    const resetToken = generateToken(user._id)
    const resetTokenExpiry = new Date(
      Date.now() +
        parseInt(process.env.JWT_RESET_PASSWORD_EXPIRES_IN) * 60 * 60 * 1000 // Convert hours to milliseconds
    )

    // update user's password reset token and expiration time
    user.passwordResetToken = resetToken
    user.passwordResetTokenExpiry = resetTokenExpiry
    await user.save()
    res
      .status(StatusCodes.OK)
      .json({ response: "Your password has been reset successfully" })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    const errorMessage = error.message || "Error requesting password reset"
    res.status(statusCode).json({ error: errorMessage })
  }
}

module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset }
