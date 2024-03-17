const express = require("express");
const router = express.Router();
const { 
    displaySearchProjects,
    getProjectDetails,
    createProject,
    editProject,
    deleteProject
} = require("../controllers/projectsController");

// GET /api/v1/projects
router.route("/projects").get(displaySearchProjects);

// POST /api/v1/projects
router.route("/projects/").post(createProject);

// GET /api/v1/projects/:projectId
router.route("/projects/:projectId").get(getProjectDetails);

// PUT /api/v1/projects/:projectId
router.route("/projects/:projectId").put(editProject);

// DELETE /api/v1/projects/:projectId
router.route("/projects/:projectId").delete(deleteProject);


module.exports = router;