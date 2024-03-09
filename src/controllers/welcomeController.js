const Project = require("../models/Project");
const asyncWrapper = require("../middleware/async-wrapper");
const { StatusCodes } = require("http-status-codes");

const getAllProjects = asyncWrapper(async (req, res) => {
    let { page, limit } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 5;
    const skip = (page - 1) * limit;

    const projects = await Project.find({}).skip(skip).limit(limit);
    const totalProjects = await Project.countDocuments({});

    const totalPages = Math.ceil(totalProjects / limit);

    res.status(StatusCodes.OK).json({
        count: projects.length,
        totalPages,
        page,
        limit,
        data: projects,
    });
});

module.exports =  { getAllProjects };

