require('dotenv').config();

const mongoose = require('mongoose');

const Project = require('./src/models/Project');
const jsonProjects = require('./mockData.json');

const populate = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Project.deleteMany();
        await Project.create(jsonProjects);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

populate();