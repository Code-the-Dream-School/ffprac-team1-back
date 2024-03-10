const Project = require("../models/Project");
const asyncWrapper = require("../middleware/async-wrapper");
const { StatusCodes } = require("http-status-codes");

const displaySearchProjects = asyncWrapper(async (req, res) => {
    let { page, limit, search } = req.query;

    // convert page and limit to numbers, with defaults
    page = Number(page) || 1;
    limit = Number(limit) || 5;
    const skip = (page - 1) * limit;

    const sortOrder = {
        "Seeking Team Members": 1,
        "Completed": 2,
        "In Progress": 3
    };

    let searchQuery = {};
    if (search) {
        const regex = new RegExp(search, 'i'); 
        // make a search query to find documents where the search term matches
        // any of the following fields: title, description, technologies, or rolesNeeded
        searchQuery = {
            $or: [
                //use $regex to search in the array for any string that matches 'regex'
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

    // make aggregation pipeline sorting projects
    const pipeline = [
        {
            $match: searchQuery //filter documents based on search criteria
        },
        {
            //$addFields stage is used to add new fields to the documents
            $addFields: {
                //add a sortOrder field to each document based on the sorting logic defined by the $switch operator.
                sortOrder: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$status", "Seeking Team Members"] }, then: sortOrder["Seeking Team Members"] },
                            { case: { $eq: ["$status", "Completed"] }, then: sortOrder["Completed"] },
                            { case: { $eq: ["$status", "In Progress"] }, then: sortOrder["In Progress"] }
                        ],
                        default: 4
                    }
                }
            }
        },
        {
            $sort: { sortOrder: 1 }
        },
        {
            $skip: skip //implement pagination by skipping a certain number of documents to preserve correct pagination
        },
        {
            $limit: limit //limit the number of documents passed to the next stage to preserve correct pagination
        }
    ];

    //execute the aggregation pipeline
    const projects = await Project.aggregate(pipeline);
    //count total matching documents for pagination
    const totalProjects = await Project.countDocuments(searchQuery);
    
    //calculate total pages
    const totalPages = Math.ceil(totalProjects / limit);

    //return paginated, sorted search results
    res.status(StatusCodes.OK).json({
        count: projects.length,
        totalPages,
        page,
        limit,
        data: projects,
    });
})

module.exports =  { displaySearchProjects };

