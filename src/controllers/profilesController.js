const cloudinary = require('cloudinary').v2; 
const fs = require('fs').promises;
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const getOwnProfile =  async (req, res) => {
    const userId = req.user.userId;
    try {
        const profile = await User.findById(userId)
            .populate('ownProjects')
            .populate('watchList')
            .select('-password -passwordResetToken -passwordResetTokenExpiry');
        if (!profile) {
            return res.status(404).json({ message: 'The profile is not found' });
        }
        res.json({ profile });
    } catch (error) {
        res.status(500).json({ message: 'The profile is unavailable. Try again later please' });
    }
}

const getUserProfile = async (req, res) => {
    const idToSearch = req.params.userId;
    try {
        const profile = await User.findById(idToSearch)
            .populate('ownProjects')
            .select('-password -passwordResetToken -passwordResetTokenExpiry -email -watchList'); 
        if (!profile) {
            return res.status(404).json({ message: 'The profile is not found' });
        }
        res.json({ profile });
    } catch (error) {
        res.status(500).json({ message: 'The profile is unavailable. Try again later please' });
    }
};

const updateUserProfile = async (req, res) => {
    const userId = req.user.userId;
    const updateData = req.body;
    try {
        if ('password' in updateData || 'email' in updateData || 'passwordResetToken' in updateData) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Direct updates to email, password, or password reset token are not allowed through this endpoint.'
            });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'The user is not found' });
        }

        if (req.files && req.files['profilePicture'] && req.files['profilePicture'][0]) {
            try {
                //deleting the old image from Cloudinary if it exists
                if (user.profilePicturePublicId) {
                    await cloudinary.uploader.destroy(user.profilePicturePublicId);
                }
                
                //uploading new image to Cloudinary
                const filePath = req.files['profilePicture'][0].path;
                const profilePictureResponse = await cloudinary.uploader.upload(filePath);
                await fs.unlink(req.files['profilePicture'][0].path); // Cleaning up the temporary file
                updateData['profilePictureUrl'] = profilePictureResponse.secure_url;
                updateData['profilePicturePublicId'] = profilePictureResponse.public_id;
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ message: "Failed to upload image", error: error.message });
            }
        } 
        
        if (req.files && req.files['coverProfilePicture'] && req.files['coverProfilePicture'][0]) {
            try {
                if (user.profileCoverPicturePublicId) {
                    await cloudinary.uploader.destroy(user.profileCoverPicturePublicId);
                }
                const filePath = req.files['coverProfilePicture'][0].path;
                const profileCoverPictureResponse = await cloudinary.uploader.upload(filePath);
                await fs.unlink(req.files['coverProfilePicture'][0].path); //сleaning up the temporary file
                updateData['profileCoverPictureUrl'] = profileCoverPictureResponse.secure_url;
                updateData['profileCoverPicturePublicId'] = profileCoverPictureResponse.public_id;
            } catch {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ message: "Failed to upload cover image", error: error.message });
            }
        }

        const updatedProfile = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true })
        .select('-password -email -passwordResetToken');
        
        res.status(StatusCodes.OK).json({ profile: updatedProfile });
        //res.status(StatusCodes.OK).json(updatedProfile);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'We could not update your profile. Try again later please.' });
    }
};

module.exports = { getOwnProfile, getUserProfile, updateUserProfile };
