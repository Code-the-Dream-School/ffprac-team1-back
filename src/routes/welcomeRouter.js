const express = require("express");
const router = express.Router();
const { displaySearchProjects } = require("../controllers/welcomeController");

router.route("/projects").get(displaySearchProjects);

module.exports = router;