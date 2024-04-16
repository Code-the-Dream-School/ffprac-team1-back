require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./src/models/User');

const populateProfileImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const result = await User.updateMany(
            { 
                profilePictureUrl: { $exists: false },
                profileCoverPictureUrl: { $exists: false }
            }, 
            {
                $set: {
                    profilePictureUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTcwNzkzNDI4Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
                    profilePicturePublicId: 'default_profile_image',
                    profileCoverPictureUrl: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY5OTYzNjc1Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
                    profileCoverPicturePublicId: 'default_profile_cover_image'
                }
            }
        );
        console.log('Update result:', result);
        console.log('Updated all profiles with default image info.');
    } catch (error) {
        console.error('Error populating profiles:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

populateProfileImages();
