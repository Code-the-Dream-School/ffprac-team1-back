const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController');
const authenticationMiddleware = require('../middleware/authentication');

// GET /api/v1/profiles/myProfile
router.get('/myProfile', authenticationMiddleware, profilesController.getOwnProfile);

// GET /api/v1/profiles/:userId
router.get('/:userId', authenticationMiddleware, profilesController.getUserProfile);

//PATCH /api/v1/profiles/myProfile
router.patch('/myProfile', authenticationMiddleware, profilesController.updateUserProfile);

module.exports = router;
