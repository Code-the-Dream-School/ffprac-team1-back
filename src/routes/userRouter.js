const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// POST /api/v1/register
router.post("/register", userController.registerUser)

// POST /api/v1/login
router.post("/login", userController.loginUser)

// POST /api/v1/logout
router.post("/logout", userController.logoutUser)

module.exports = router
