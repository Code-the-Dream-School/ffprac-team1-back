const express = require("express");
const router = express.Router();
const { projectCreationRules } = require('../middleware/validationRules');
const validate = require('../middleware/validationResultHandler');
const { 
    displaySearchProjects,
    getProjectDetails,
    createProject,
    editProject,
    deleteProject
} = require("../controllers/projectsController");
const authenticationMiddleware = require("../middleware/authentication");

// GET /api/v1/projects
router.route("/projects").get(displaySearchProjects);

// POST /api/v1/projects
router.route("/projects")
    .post(authenticationMiddleware, projectCreationRules(), validate, createProject);

// GET /api/v1/projects/:projectId
router.route("/projects/:projectId").get(getProjectDetails);

// PUT /api/v1/projects/:projectId
router.route("/projects/:projectId")
    .put(authenticationMiddleware, editProject);

// DELETE /api/v1/projects/:projectId
router.route("/projects/:projectId")
    .delete(authenticationMiddleware, deleteProject);

module.exports = router;