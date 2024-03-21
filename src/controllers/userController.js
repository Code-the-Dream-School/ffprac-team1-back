const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User.js');

// Function to generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const jwtLifetime = process.env.JWT_LIFETIME;
  const token = jwt.sign({ userId }, secret, { expiresIn: jwtLifetime });
  return token;
};

const registerUser = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const { email, password, firstName, lastName } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }], // Updated to check only for email as unique identifier
    });
    if (existingUser) {
      throw new BadRequestError('User already exists.');
    }

    // Create a new user
    const newUser = new User({ email, password, firstName, lastName });
    await newUser.save();
    console.log('User registered:', newUser);

    // Generate and send JWT token
    const token = generateToken(newUser._id);

    res
      .status(StatusCodes.OK)
      .json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Error registering user';
    res.status(statusCode).json({ error: errorMessage });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthenticatedError('Invalid password');
    }

    // Generate and send JWT token
    const token = generateToken(user._id);
    res.status(StatusCodes.OK).json({
      message: 'Logged in successful',
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Error logging in';
    res.status(statusCode).json({ error: errorMessage });
  }
};

const logoutUser = (req, res) => {
  try {
    // Clear the 'token' cookie or session
    res.clearCookie('token', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error during logout:', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Logout failed' });
  }
};

module.exports = { registerUser, loginUser, logoutUser };
