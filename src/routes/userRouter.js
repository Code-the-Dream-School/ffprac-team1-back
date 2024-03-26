const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticationMiddleware = require('../middleware/authentication');

// POST /api/v1/users/register
router.post('/register', userController.registerUser);

// POST /api/v1/users/login
router.post('/login', userController.loginUser);

// POST /api/v1/users/logout
router.post('/logout', userController.logoutUser);

// GET /api/v1/profile (protected route)
router.get('/profile', authenticationMiddleware, (req, res) => {
  // access the authenticated user from req.user
  res.json({ message: 'Accessing protected profile route', user: req.user });
});

module.exports = router;
