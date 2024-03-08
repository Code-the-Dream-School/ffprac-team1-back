const mongoose = require('mongoose');
const TechnologiesSchema = require('./technologiesSchema'); 

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
        'Mentor',
        'Frontend Developer', 
        'Backend Developer', 
        'Fullstack Developer', 
        'Team Lead',
        'UI/UX Designer', 
        'Project Manager', 
        'DevOps Engineer', 
        'Quality Assurance Engineer'
      ]
  }],
  likes: {
    type: Number,
    default: 0
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user'],
  },
}, { timestamps: true }); 

const ProjectModel = mongoose.model('Project', ProjectSchema, 'Projects');

module.exports = ProjectModel;