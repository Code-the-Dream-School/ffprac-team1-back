const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const getUserProfile = async (req, res) => {
    const idToSearch = req.params.userId;
    try {
        const profile = await User.findById(idToSearch)
            .populate('ownProjects')
            .select('-password -passwordResetToken'); 
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
    const profileIdToUpdate = req.params.userId; 
    try {
        if ('password' in updateData || 'email' in updateData || 'passwordResetToken' in updateData) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Direct updates to email, password, or password reset token are not allowed through this endpoint.'
            });
        }

        if (userId !== profileIdToUpdate) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You can only update your own profile.' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
            .select('-password -email -passwordResetToken');

        if (!updatedUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'The user is not found' });
        }

        res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'We could not update your profile. Try again later please.' });
    }
};

module.exports = { getUserProfile, updateUserProfile };
