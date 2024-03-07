const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// POST /api/v1/register
router.post("/register", (req, res) => {
  console.log("Received a registration request")
  userController.registerUser(req, res)
})

module.exports = router
