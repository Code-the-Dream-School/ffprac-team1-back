const mongoose = require("mongoose");
const TechnologiesSchema = require("./Technologies"); 

const urlValidationPattern = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;

const validateURL = (url) => {
    if (url === null) {
      return true; 
    }
    return urlValidationPattern.test(url);
  };

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [100, 'The project title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: true,
    maxlength: [700, 'The project description cannot exceed 700 characters'],
  },
  status: {
    type: String,
    required: true,
    enum: ["Seeking Team Members", "In Progress", "Completed"],
    default: "Seeking Team Members" 
  },
  technologies: TechnologiesSchema,
  rolesNeeded: [{
    type: String,
    required: true,
    enum: [
        "Mentor",
        "Frontend Developer", 
        "Backend Developer", 
        "Fullstack Developer", 
        "Team Lead",
        "UI/UX Designer", 
        "Project Manager", 
        "DevOps Engineer", 
        "Quality Assurance Engineer"
      ]
  }],
  likeCount: { 
    type: Number, 
    default: 0 
  }, 
  applicants: [{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
        required: true,
        enum: [
            "Mentor",
            "Frontend Developer", 
            "Backend Developer", 
            "Fullstack Developer", 
            "Team Lead",
            "UI/UX Designer", 
            "Project Manager", 
            "DevOps Engineer", 
            "Quality Assurance Engineer"
        ]
    }
  }],
  participants:[{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
        required: true,
        enum: [
            "Mentor",
            "Frontend Developer", 
            "Backend Developer", 
            "Fullstack Developer", 
            "Team Lead",
            "UI/UX Designer", 
            "Project Manager", 
            "DevOps Engineer", 
            "Quality Assurance Engineer"
        ]
      }
    }],
  projectPictureUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNzkzNDI4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
    validate: [validateURL, 'Please provide a valid URL.'], 
  },
  projectPicturePublicId: {
    type: String,
    default: 'default_project_image'
  },
  projectCoverPictureUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY5OTYzNjc1Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
    validate: [validateURL, 'Please provide a valid URL.'], 
  },
  projectCoverPicturePublicId: {
    type: String,
    default: 'default_project_cover_image'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a user"],
  },
}, { timestamps: true }); 

ProjectSchema.index({
  title: 'text',
  description: 'text',
  'technologies.frontend': 'text',
  'technologies.backend': 'text',
  'technologies.design': 'text',
  'technologies.projectManagement': 'text',
  'technologies.devOps': 'text',
  'technologies.qualityAssurance': 'text',
  'technologies.database': 'text',
  rolesNeeded: 'text'
}, { default_language: "none" });

const ProjectModel = mongoose.model("Project", ProjectSchema, "Projects");

module.exports = ProjectModel;