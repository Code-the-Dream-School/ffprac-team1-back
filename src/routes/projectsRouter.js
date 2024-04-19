const express = require("express");
const router = express.Router();
const { projectCreationRules, projectEditingRules } = require('../middleware/validationRules');
const validate = require('../middleware/validationResultHandler');
const { 
    displaySearchProjects,
    getProjectDetails,
    suggestSearchWord,
    createProject,
    editProject,
    deleteProject,
    toggleLike,
    applyToParticipate,
    approveApplicant,
    rejectApplicant,
    removeParticipant
} = require("../controllers/projectsController");
const authenticationMiddleware = require("../middleware/authentication");
const optionalAuthenticationMiddleware = require("../middleware/optionalAuthentication");
const upload = require('../middleware/multerMiddleware');

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
    .patch(authenticationMiddleware, projectEditingRules(), validate, upload, editProject);

// DELETE /api/v1/projects/:projectId
router.route("/:projectId")
    .delete(authenticationMiddleware, deleteProject);

// PUT /api/v1/projects/:projectId/like'
router.route("/:projectId/like")
    .patch(authenticationMiddleware, toggleLike);

// POST /api/v1/projects/:projectId/apply"
router.route("/:projectId/apply")
    .post(authenticationMiddleware, applyToParticipate);

// POST /api/v1/projects/:projectId/approve/:applicationId'"
router.route("/:projectId/approve/:applicationId")
    .post(authenticationMiddleware, approveApplicant);

// POST /api/v1/projects/:projectId/reject/:applicationId'"
router.route("/:projectId/reject/:applicationId")
    .post(authenticationMiddleware, rejectApplicant);

// DELETE /api/v1/projects/:projectId/participants/:participantId'"
router.route("/:projectId/participants/:participantId")
    .delete(authenticationMiddleware, removeParticipant);

module.exports = router;