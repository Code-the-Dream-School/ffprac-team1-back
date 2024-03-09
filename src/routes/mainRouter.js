const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController.js');

router.get('/projects', mainController.get);

module.exports = router;