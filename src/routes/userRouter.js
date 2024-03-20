const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// POST /api/v1/users/register
router.post("/register", userController.registerUser)

// POST /api/v1/users/login
router.post("/login", userController.loginUser)

// POST /api/v1/users/logout
router.post("/logout", userController.logoutUser)

module.exports = router
