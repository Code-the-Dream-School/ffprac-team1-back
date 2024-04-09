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
        { $or: searchQueries }, // Query
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
        const sort = { score: { $meta: "textScore" } };
        //fetching the results from MongoDB
        const results = await Project.find(query, projection)
                                .sort(sort)
                                .skip(skip)
                                .limit(limit);

        //calculating missing words for each project
        const detailedResults = await Promise.all(results.map(project => {
            const projectObj = project.toObject();
            
            let searchableText = `${projectObj.title} ${projectObj.description} ` +
                `${Object.values(projectObj.technologies).flat().join(' ')} ${projectObj.rolesNeeded.join(' ')}`.toLowerCase();
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
        likes: project.likes,
        technologies: project.technologies,
        rolesNeeded: project.rolesNeeded,
        createdBy: isAuthorized ? project.createdBy : undefined,
        participants: isAuthorized ? project.participants : undefined,
        applicants: isCreator ? project.applicants : undefined,
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
    if (req.body.technologies) {
        for (const [key, value] of Object.entries(req.body.technologies)) {
            updateData[`technologies.${key}`] = value;
        }
    }

    Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'technologies') {
            updateData[key] = value;
        }
    });

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

    await Project.findByIdAndDelete(projectId); 

    res.status(StatusCodes.OK).json({ message: 'Project successfully deleted' });
});

const toggleLike = async (req, res) => {
    const { projectId } = req.params; 
    const userId = req.user.userId; 

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }
    
        const existingLike = await ProjectLikes.findOne({ projectId, userId });
    
        if (existingLike) {
            await ProjectLikes.findByIdAndDelete(existingLike._id);
            project.likeCount = Math.max(0, project.likeCount - 1);
        } else {
            await new ProjectLikes({ projectId, userId }).save();
            project.likeCount += 1; 
        }
    
        await project.save(); 
    
        return res.status(StatusCodes.OK).json({
            liked: !existingLike,
            totalLikes: project.likeCount 
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred' });
    }
};
module.exports =  { 
    displaySearchProjects,
    getProjectDetails,
    suggestSearchWord,
    createProject,
    editProject,
    deleteProject,
    toggleLike
};
