const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// POST /api/v1/register
router.post("/register", userController.registerUser)

module.exports = router
