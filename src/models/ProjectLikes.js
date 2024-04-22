const mongoose = require("mongoose");

const ProjectLikesSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
});

const ProjectLikesModel = mongoose.model("ProjectLike", ProjectLikesSchema, "ProjectLikes");

module.exports = ProjectLikesModel;
