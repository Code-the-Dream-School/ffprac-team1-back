require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProjectLikes = require('./src/models/ProjectLikes'); 

const populateWatchList = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const likes = await ProjectLikes.find();

        for (const like of likes) {
            await User.findByIdAndUpdate(like.userId, {
                $addToSet: { watchList: like.projectId }
            });
        }

        console.log('All liked projects have been added to users\' watchLists.');
    } catch (error) {
        console.error('Error populating watchList:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

populateWatchList();
