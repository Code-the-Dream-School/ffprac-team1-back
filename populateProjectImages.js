require('dotenv').config();

const mongoose = require('mongoose');
const Project = require('./src/models/Project');

const populateProjectImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const result = await Project.updateMany(
            { 
              projectPictureUrl: { $exists: false },
              projectCoverPictureUrl: { $exists: false }
            }, 
            {
              $set: {
                projectPictureUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNzkzNDI4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
                projectPicturePublicId: 'default_project_image',
                projectCoverPictureUrl: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY5OTYzNjc1Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
                projectCoverPicturePublicId: 'default_project_cover_image'
              }
            }
        );
        console.log('Update result:', result);
        console.log('Updated all projects with default image info.');
    } catch (error) {
        console.error('Error populating projects:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

populateProjectImages();
