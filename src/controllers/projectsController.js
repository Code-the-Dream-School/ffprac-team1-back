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

    try {
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
            
                const searchableText = `${projectObj.title} ${projectObj.description} ` +
                    `${Object.values(projectObj.technologies).flat().join(' ')} ${projectObj.rolesNeeded.join(' ')}`.toLowerCase();
                projectObj.missingWords = searchWords.filter(word => 
                    !searchableText.includes(word.toLowerCase()));
            
                const isCreator = req.user && projectObj.createdBy.toString() === req.user.userId;
                if (!isCreator) {
                    //hiding applicants and participantsif not creator
                    delete projectObj.applicants;
                    delete projectObj.participants;            
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
                const isCreator = req.user && projectObj.createdBy.toString() === req.user.userId;
                if (!isCreator) {
                    delete projectObj.applicants;
                    delete projectObj.participants;            
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
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
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
