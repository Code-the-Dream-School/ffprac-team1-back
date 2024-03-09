const express = require("express");
const router = express.Router();
const { getAllProjects } = require("../controllers/welcomeController");

router.route("/").get(getAllProjects);

module.exports = router;