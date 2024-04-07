const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const authenticationMiddleware = require('../middleware/authentication');

// GET /api/v1/profiles/:userId
router.get('/:userId', authenticationMiddleware, profilesController.getUserProfile);

//PATCH /api/v1/profiles/:userId
router.patch('/:userId', authenticationMiddleware, profilesController.updateUserProfile);

module.exports = router;
