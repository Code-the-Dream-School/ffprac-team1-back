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

module.exports = { getOwnProfile, getUserProfile, updateUserProfile };
