const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()
const User = require("../models/User.js")

// Function to generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  const token = jwt.sign({ userId }, secret, { expiresIn: "1h" })
  return token
}

const registerUser = async (req, res) => {
  try {
    console.log("Request Body:", req.body)
    const { username, email, password, firstName, lastName } = req.body

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create a new user
    const newUser = new User({ username, email, password, firstName, lastName })
    await newUser.save()
    console.log("User registered:", newUser)

    // Generate and send JWT token
    const token = generateToken(newUser._id)

    res.status(201).json({ message: "User registered successfully", token })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    // Generate and send JWT token
    const token = generateToken(user._id)
    res.status(200).json({ message: "Login successful", token })
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const logoutUser = (req, res) => {
  res.status(200).json({ message: "Logout successful" })
}

module.exports = { registerUser, loginUser, logoutUser }
