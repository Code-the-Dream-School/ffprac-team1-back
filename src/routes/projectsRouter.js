const express = require("express");
const router = express.Router();
const { displaySearchProjects } = require("../controllers/projectsController");

// GET /api/v1/projects
router.route("/projects").get(displaySearchProjects);

module.exports = router;