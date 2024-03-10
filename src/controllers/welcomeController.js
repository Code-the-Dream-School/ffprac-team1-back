const Project = require("../models/Project");
const asyncWrapper = require("../middleware/async-wrapper");
const { StatusCodes } = require("http-status-codes");

const displaySearchProjects = asyncWrapper(async (req, res) => {
    let { page, limit, search } = req.query;

    let searchQuery = {};
    if (search) {
        const regex = new RegExp(search, 'i'); 
        // making a search query to find documents where the search term matches
        // any of the following fields: title, description, technologies, or rolesNeeded
        searchQuery = {
            $or: [
                //using $regex to search in the array for any string that matches 'regex'
                { title: regex },
                { description: regex },
                { "technologies.frontend": { $regex: regex } },
                { "technologies.backend": { $regex: regex } },
                { "technologies.design": { $regex: regex } },
                { "technologies.projectManagement": { $regex: regex } },
                { "technologies.devOps": { $regex: regex } },
                { "technologies.qualityAssurance": { $regex: regex } },
                { "technologies.database": { $regex: regex } },
                { rolesNeeded: { $regex: regex } }
            ]
        };
    }

    page = Number(page) || 1;
    limit = Number(limit) || 5;
    const skip = (page - 1) * limit;

    const projects = await Project.find(searchQuery).skip(skip).limit(limit);
    const totalProjects = await Project.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalProjects / limit);

    res.status(StatusCodes.OK).json({
        count: projects.length,
        totalPages,
        page,
        limit,
        data: projects,
    });
})

module.exports =  { displaySearchProjects };

