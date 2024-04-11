//the code to associate the existing projects with their creators: have been run successfully
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./src/models/User');
const Project = require('./src/models/Project');

const associateProjects = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const projects = await Project.find();
        for (const project of projects) {
        await User.findByIdAndUpdate(project.createdBy, {
            $addToSet: { ownProjects: project._id }
        });
        }
        console.log('All projects have been associated with their creators.');
    } catch (error) {
        console.error('Error associating projects with users:', error);
    }
};

associateProjects();
