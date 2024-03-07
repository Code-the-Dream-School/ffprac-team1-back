const User = require("../models/User.js")

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // check if user already exists
    const existingUser = await User.findOne({ _id: [{ username }, { email }] })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create a new user
    const newUser = new User({ username, email, password })
    await newUser.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = { registerUser }
