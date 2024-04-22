
const cloudinary = require('cloudinary').v2; 
const fs = require('fs').promises;
const Project = require("../models/Project");
const User = require("../models/User");
const ProjectLikes = require('../models/ProjectLikes'); 
const asyncWrapper = require("../middleware/async-wrapper");
const { NotFoundError } = require ("../errors");
const { StatusCodes } = require("http-status-codes");

const suggestSearchWord = asyncWrapper(async (req, res) => {
    const query = req.query.q; 
    if (!query) {
        return res.json([]);
    }
    
    const regexPattern = new RegExp(query, 'i'); 
    const searchQueries = [
        { title: { $regex: regexPattern } },
        { description: { $regex: regexPattern } },
        { "technologies.frontend": { $regex: regexPattern } },
        { "technologies.backend": { $regex: regexPattern } },
        { "technologies.design": { $regex: regexPattern } },
        { "technologies.projectManagement": { $regex: regexPattern } },
        { "technologies.devOps": { $regex: regexPattern } },
        { "technologies.qualityAssurance": { $regex: regexPattern } },
        { "technologies.database": { $regex: regexPattern } },
        { rolesNeeded: { $regex: regexPattern } },
    ];

    const matchingProjects = await Project.find(
        { $or: searchQueries }, 
        { applicants: 0, participants: 0, createdBy: 0, likeCount: 0, createdAt: 0 }
        );
    
    //initialize an empty set to store distinct words
    const distinctWords = new Set();

    //iterate over each project and extract distinct words from relevant fields
    matchingProjects.forEach(project => {
        //extract words from the title, description, status, and rolesNeeded fields
        const { title, description, status, rolesNeeded } = project;
        addMatchingWordsToSet(title);
        addMatchingWordsToSet(description);
        addMatchingWordsToSet(status);
        rolesNeeded.forEach(role => addMatchingWordsToSet(role));

        //extract words from the technologies field
        const technologies = Object.values(project.technologies).flat().join(' ');
        addMatchingWordsToSet(technologies);
    });

    //convert the set to an array and send as response
    const distinctWordsArray = Array.from(distinctWords);
    res.json(distinctWordsArray);

    // helper function to add matching words to the set, splitting them by non-word characters
    function addMatchingWordsToSet(text) {
        const words = text.split(/\W+/);
        words.forEach(word => {
            if (word.toLowerCase().includes(query.toLowerCase())) {
                distinctWords.add(word.toLowerCase());
            }
        });
    }
})

const displaySearchProjects = asyncWrapper(async (req, res) => {
    let { page, limit, search } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    if (search) {
        const searchWords = search.split(/[\s,.;+]+/).filter(word => word.length > 0);
        const query = { $text: { $search: search } };
        const projection = { score: { $meta: "textScore" } };
        const sort = { score: { $meta: "textScore" }, _id: 1 };
        //fetching the results from MongoDB
        const results = await Project.find(query, projection)
                                .sort(sort)
                                .skip(skip)
                                .limit(limit);

        //calculating missing words for each project
        const detailedResults = await Promise.all(results.map(project => {
            const projectObj = project.toObject();

            let searchableText = `${projectObj.title} ${projectObj.description} ` +
                (projectObj.technologies ? `${Object.values(projectObj.technologies).flat().join(' ')}` : '') +
                ` ${projectObj.rolesNeeded.join(' ')}`;

            searchableText= searchableText.toLowerCase();

            projectObj.missingWords = searchWords.filter(word => 
                !searchableText.includes(word.toLowerCase()));

            const isAuthorized = req.user && req.user.userId ;
            if (!isAuthorized) {
                delete projectObj.createdBy; 
                delete projectObj.participants; 
                delete projectObj.applicants;   
            }
            const isCreator = req.user && projectObj.createdBy.toString() === req.user.userId;
            if (!isCreator) {
                //hiding applicants if the user is not a creator
                delete projectObj.applicants;       
            }
            
            return projectObj;
        }));
        const totalProjects = await Project.countDocuments(query);
        const totalPages = Math.ceil(totalProjects / limit);

        //returning detailedResults with the missing words information
        res.status(StatusCodes.OK).json({
            count: detailedResults.length,
            totalPages,
            page,
            limit,
            data: detailedResults,
        });
    } else {
        const projects = await Project.find().skip(skip).limit(limit);
        const totalProjects = await Project.countDocuments();
        const totalPages = Math.ceil(totalProjects / limit);

        const processedProjects = projects.map(project => {
            const projectObj = project.toObject();

            const isAuthorized = req.user && req.user.userId ;
            if (!isAuthorized) {
                delete projectObj.createdBy; 
                delete projectObj.participants; 
                delete projectObj.applicants;   
            }
            
            const isCreator = req.user && projectObj.createdBy.toString() === req.user.userId;
            if (!isCreator) {
                delete projectObj.applicants;        
            }
            return projectObj;
        });


        res.status(StatusCodes.OK).json({
            count: processedProjects.length,
            totalPages,
            page,
            limit,
            data: processedProjects,
        });
    }
});

const getProjectDetails = asyncWrapper(async (req, res, next) => {
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId });

    if (!project) {
        throw new NotFoundError('The project does not exist');
    }

    const isAuthorized = req.user && req.user.userId ;
    const isCreator = req.user && req.user.userId === project.createdBy.toString();

    let response = {
        title: project.title,
        description: project.description,
        status: project.status,
        technologies: project.technologies,
        rolesNeeded: project.rolesNeeded,
        createdBy: isAuthorized ? project.createdBy : null,
        participants: isAuthorized ? project.participants : null,
        applicants: isCreator ? project.applicants : null,
        projectCoverPictureUrl: project.projectCoverPictureUrl,
        projectPictureUrl: project.projectPictureUrl,
        likeCount: project.likeCount
    };

    res.status(StatusCodes.OK).json({ project: response });
})

const createProject = asyncWrapper(async (req, res, next) => {
    const { userId: createdBy } = req.user;
    const projectData = {
        ...req.body,
        createdBy 
    };

    delete projectData.applicants;
    delete projectData.participants;
    
    const project = await Project.create(projectData); 

    await User.findByIdAndUpdate(createdBy, { $push: { ownProjects: project._id } });

    res.status(StatusCodes.CREATED).json({ project }); 
});
    
const editProject = asyncWrapper(async (req, res, next) => {
    const { projectId } = req.params; 
    const userId = req.user.userId; 

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "You do not have permission to edit this project." });
    }

    const updateData = {};
    //handling the correct technologies update due to their complex structure
    if (req.body.technologies) {
        for (const [key, value] of Object.entries(req.body.technologies)) {
            updateData[`technologies.${key}`] = value;
        }
    }
    
    //prohibiting from editing the likes number
    Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'technologies' && key !== 'likeCount') {
            updateData[key] = value;
        }
    });

    if (req.files && req.files['projectPicture'] && req.files['projectPicture'][0]) {
        try {
            //deleting the old image from Cloudinary if it exists
            if (project.projectPicturePublicId) {
                await cloudinary.uploader.destroy(project.projectPicturePublicId);
            }
            
            //uploading new image to Cloudinary
            const filePath = req.files['projectPicture'][0].path;
            const projectPictureResponse = await cloudinary.uploader.upload(filePath);
            await fs.unlink(req.files['projectPicture'][0].path); // Cleaning up the temporary file
            updateData['projectPictureUrl'] = projectPictureResponse.secure_url;
            updateData['projectPicturePublicId'] = projectPictureResponse.public_id;
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).json({ message: "Failed to upload image", error: error.message });
        }
    } 
    
    if (req.files && req.files['coverProjectPicture'] && req.files['coverProjectPicture'][0]) {
        try {
            if (project.projectCoverPicturePublicId) {
                await cloudinary.uploader.destroy(project.projectCoverPicturePublicId);
            }
            const filePath = req.files['coverProjectPicture'][0].path;
            const coverPictureResponse = await cloudinary.uploader.upload(filePath);
            await fs.unlink(req.files['coverProjectPicture'][0].path); //сleaning up the temporary file
            updateData['projectCoverPictureUrl'] = coverPictureResponse.secure_url;
            updateData['projectCoverPicturePublicId'] = coverPictureResponse.public_id;
        } catch {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).json({ message: "Failed to upload cover image", error: error.message });
        }
    }

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $set: updateData }, 
        { new: true, runValidators: true } 
    );

    res.status(StatusCodes.OK).json({ project: updatedProject });
})

const deleteProject = asyncWrapper(async (req, res, next) => {
    const { projectId } = req.params; 
    const userId = req.user.userId; 

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to delete this project.' });
    }

    if (project.projectPicturePublicId) {
        await cloudinary.v2.uploader.destroy(project.projectPicturePublicId);
    }
    
    if (project.projectCoverPicturePublicId) {
        await cloudinary.v2.uploader.destroy(project.projectCoverPicturePublicId);
    }

    await Project.findByIdAndDelete(projectId); 

    res.status(StatusCodes.OK).json({ message: 'Project successfully deleted' });
});

const toggleLike = asyncWrapper(async (req, res, next) => {
    const { projectId } = req.params; 
    const userId = req.user.userId; 

    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    const existingLike = await ProjectLikes.findOne({ projectId, userId });
    const user = await User.findById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }
    
    if (existingLike) {
        await ProjectLikes.findByIdAndDelete(existingLike._id);
        project.likeCount = Math.max(0, project.likeCount - 1);
        user.watchList.pull(projectId); // .pull() removes an item from the Mongoose array
    } else {
        await new ProjectLikes({ projectId, userId }).save();
        project.likeCount += 1; 
        user.watchList.push(projectId); // .push() adds an item to the array
    }
    
    await project.save(); 
    await user.save(); 

    return res.status(StatusCodes.OK).json({
        liked: !existingLike,
        totalLikes: project.likeCount 
    });
});


const applyToParticipate = asyncWrapper(async (req, res, next) => {
    const projectId = req.params.projectId;
    const userId = req.user.userId; 
    const { role } = req.body;

    if (!role) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Role is required but not provided.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    //checking if the role applied for is in the rolesNeeded list
    if (!project.rolesNeeded.includes(role)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This role is not required in this project.' });
    }

    //checking if the role is already taken by a participant
    const isRoleTaken = project.participants.some(participant => participant.role === role);
    if (isRoleTaken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This role is already taken.' });
    }

    //checking if user has already applied for any role in this project
    const alreadyApplied = project.applicants.some(applicant => applicant.user.toString() === userId);
    if (alreadyApplied) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Already applied' });
    }

    //adding the user to the project's applicants list
    project.applicants.push({ user: userId, role: role });
    await project.save();

    //adding the project to the user's appliedProjects list
    const user = await User.findById(userId);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
    user.appliedProjects.push({ project: projectId, role: role });
    await user.save();

    //TO DO: notification
    res.status(StatusCodes.OK).json({ message: 'Application submitted' });
});

const approveApplicant = asyncWrapper(async (req, res, next) => {
    const { projectId, applicationId } = req.params;
    const userId = req.user.userId; 
    console.log(applicationId)
    
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to delete this project.' });
    }

    //finding the applicant entry using the applicationId
    const applicantEntry = project.applicants.find(applicant => applicant._id.toString() === applicationId);
    if (!applicantEntry) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Application not found' });
    }

    //checking if user has already applied for any role in this project
    const alreadyApproved = project.participants.some(participant => participant.user.toString() === applicantEntry.user);
    if (alreadyApproved) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Already approved' });
    }

    //moving the applicant to the project's participants list, removing from the applicants' one
    project.participants.push({ user: applicantEntry.user, role: applicantEntry.role });
    project.applicants = project.applicants.filter(applicant => applicant._id.toString() !== applicationId);
    await project.save();

    //finding the user by the id of the application entry
    const user = await User.findById(applicantEntry.user);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
    
    //removing from appliedProjects and add to participatingProjects
    user.appliedProjects = user.appliedProjects.filter(ap => ap.project.toString() !== projectId);
    user.participatingProjects.push({ project: projectId, role: applicantEntry.role });
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Applicant approved' });
});

const rejectApplicant = asyncWrapper(async (req, res, next) => {
    const { projectId, applicationId } = req.params; 
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== userId && !project.applicants.some(applicant => applicant.user.toString() === applicationId && applicant.user.toString() === userId)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to modify this project.' });
    }

    //finding the application entry using the applicationId
    const applicantEntry = project.applicants.find(applicant => applicant._id.toString() === applicationId);
    if (!applicantEntry) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Application not found' });
    }

    //removing the applicant from the applicants list
    project.applicants = project.applicants.filter(applicant => applicant._id.toString() !== applicationId);
    await project.save();

    //updating the user's appliedProjects list to remove this project
    const user = await User.findById(applicantEntry.user);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    user.appliedProjects = user.appliedProjects.filter(ap => ap.project.toString() !== projectId);
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Applicant rejected' });
});


const removeParticipant = asyncWrapper(async (req, res, next) => {
    const { projectId, participantId } = req.params; 
    const userId = req.user.userId; 

    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    //checking if the requester is the project creator
    if (project.createdBy.toString() !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to remove participants from this project.' });
    }

    //checking if the participant is actually part of the project
    const isParticipant = project.participants.some(participant => participant.user.toString() === participantId);
    if (!isParticipant) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Participant not found in this project' });
    }

    //removing the participant
    project.participants = project.participants.filter(participant => participant.user.toString() !== participantId);
    await project.save();

    //updating the user's document to reflect that they are no longer participating in this project
    const user = await User.findById(participantId);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    user.participatingProjects = user.participatingProjects.filter(participation => participation.project.toString() !== projectId);
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Participant removed successfully' });
});


module.exports =  { 
    displaySearchProjects,
    getProjectDetails,
    suggestSearchWord,
    createProject,
    editProject,
    deleteProject,
    toggleLike,
    applyToParticipate,
    approveApplicant,
    rejectApplicant,
    removeParticipant
};
