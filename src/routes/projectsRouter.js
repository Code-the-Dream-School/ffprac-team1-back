const express = require("express");
const router = express.Router();
const { projectCreationRules } = require('../middleware/validationRules');
const validate = require('../middleware/validationResultHandler');
const { 
    displaySearchProjects,
    getProjectDetails,
    suggestSearchWord,
    createProject,
    editProject,
    deleteProject,
    toggleLike
} = require("../controllers/projectsController");
const authenticationMiddleware = require("../middleware/authentication");
const optionalAuthenticationMiddleware = require("../middleware/optionalAuthentication");

// GET /api/v1/projects
router.route("/")
    .get(optionalAuthenticationMiddleware, displaySearchProjects);

// POST /api/v1/projects
router.route("/")
    .post(authenticationMiddleware, projectCreationRules(), validate, createProject);

// GET /api/v1/projects/suggestions
router.route("/suggestions")
.get(suggestSearchWord);

// GET /api/v1/projects/:projectId
router.route("/:projectId")
    .get(optionalAuthenticationMiddleware, getProjectDetails);

// PATCH /api/v1/projects/:projectId
router.route("/:projectId")
    .patch(authenticationMiddleware, editProject);

// DELETE /api/v1/projects/:projectId
router.route("/:projectId")
    .delete(authenticationMiddleware, deleteProject);

// PUT /api/v1/projects/:projectId/like'
router.route("/:projectId/like")
    .patch(authenticationMiddleware, toggleLike);

module.exports = router;