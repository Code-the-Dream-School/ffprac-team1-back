const Project = require("../models/Project");
const ProjectLikes = require('../models/ProjectLikes'); 
const asyncWrapper = require("../middleware/async-wrapper");
const { NotFoundError } = require ("../errors");
const { StatusCodes } = require("http-status-codes");

const displaySearchProjects = asyncWrapper(async (req, res) => {
    let { page, limit, search } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    if (search) {
        const searchWords = search.split(/[\s,;+]+/);
        const regexQueries = searchWords.map(word => {
            const regexPattern = new RegExp(word, 'i');
                    return {
                $or: [ //$or condition: if it matches any of the conditions listed within the array
                    { title: { $regex: regexPattern } },
                    { description: { $regex: regexPattern } },
                    { status: { $regex: regexPattern } },
                    { "technologies.frontend": { $regex: regexPattern } },
                    { "technologies.backend": { $regex: regexPattern } },
                    { "technologies.design": { $regex: regexPattern } },
                    { "technologies.projectManagement": { $regex: regexPattern } },
                    { "technologies.devOps": { $regex: regexPattern } },
                    { "technologies.qualityAssurance": { $regex: regexPattern } },
                    { "technologies.database": { $regex: regexPattern } },
                    { rolesNeeded: { $regex: regexPattern } },
                ]
            };
        });

        //perform the query with prioritization
        try {
            //find documents that match all search terms first
            //$and condition: if it matches all the conditions listed within the array
            const allMatches = await Project.find({ $and: regexQueries })
                                            .skip(skip)
                                            .limit(limit);

            //collect IDs of all matched projects to exclude them in the next query
            const excludedIds = allMatches.map(project => project._id);

            let results = allMatches;

            //check if there is room to include more projects in the results on the page
            if (allMatches.length < limit) {
                //find documents that match any search terms
                const anyMatches = await Project.find({
                    $and: [
                        { _id: { $nin: excludedIds } }, //exclude already matched projects
                        { $or: regexQueries }
                    ]
                })
                .skip(skip)
                .limit(limit - allMatches.length);

                const findMissingWords = (sourceText, searchWords) => {
                    return searchWords.filter(word =>
                        !sourceText.toLowerCase().includes(word.toLowerCase())
                    );
                };
                
                const buildSearchableTextFromProject = (project) => {
                    let searchableTextComponents = [project.title, project.description];
                
                    const techFields = ['frontend', 'backend', 'design', 'projectManagement', 'devOps', 'qualityAssurance', 'database'];
                    techFields.forEach(field => {
                        if (project.technologies && project.technologies[field]) {
                            searchableTextComponents.push(...project.technologies[field]);
                        }
                    });
                
                    if (project.rolesNeeded && project.rolesNeeded.length > 0) {
                        searchableTextComponents.push(...project.rolesNeeded);
                    }
                
                    return searchableTextComponents.join(' ');
                };
                
                //enhance anyMatches with missing words information
                const enhancedAnyMatches = anyMatches.map(project => {
                    const searchableText = buildSearchableTextFromProject(project);
                    const missingWords = findMissingWords(searchableText, searchWords);
                
                //convert to a plain object to add custom properties
                const projectObj = project.toObject(); 
                projectObj.missingWords = missingWords;
                projectObj.missingCount = missingWords.length; // Add the number of missing words for sorting

                return projectObj;
                });
                //sort enhancedAnyMatches based on the number of missing words, ascending
                enhancedAnyMatches.sort((a, b) => a.missingCount - b.missingCount);
                
                results = [...allMatches, ...enhancedAnyMatches];
            }

            const totalProjects = await Project.countDocuments({ $or: regexQueries });
            const totalPages = Math.ceil(totalProjects / limit);

            res.status(StatusCodes.OK).json({
                count: results.length,
                totalPages,
                page,
                limit,
                data: results,
            });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    } else {
        //handle the case where no search term is provided
        const projects = await Project.find().skip(skip).limit(limit);
        const totalProjects = await Project.countDocuments();
        const totalPages = Math.ceil(totalProjects / limit);

        const data = projects.map(project => {
            const projectObj = project.toObject();
            
            const isCreator = req.user && req.user.userId === project.createdBy.toString();
            projectObj.applicants = isCreator ? project.applicants : undefined;
    
            projectObj.participants = req.user && req.user.userId ? project.participants : undefined;
    
            return projectObj;
        });

        res.status(StatusCodes.OK).json({
            count: projects.length,
            totalPages,
            page,
            limit,
            data,
        });
    }
});

const getProjectDetails = asyncWrapper(async (req, res, next) => {
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId });

    if (!project) {
        throw new NotFoundError('The project does not exist');
    }

    const isCreator = req.user && req.user.userId === project.createdBy.toString();

    let response = {
        title: project.title,
        description: project.description,
        status: project.status,
        likes: project.likes,
        technologies: project.technologies,
        rolesNeeded: project.rolesNeeded,
        createdBy: req.user && req.user.userId ? project.createdBy : undefined,
        participants: req.user && req.user.userId ? project.participants : undefined,
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

    delete projectData.likes;
    delete projectData.applicants;
    delete projectData.participants;
    
    const project = await Project.create(projectData); 
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
    createProject,
    editProject,
    deleteProject,
    toggleLike
};
