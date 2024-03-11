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
    

    let matchConditions = [];
    if (search) {
        //split the search string into individual words
        const searchWords = search.split(" ");
        //construct regex match conditions for each word for partial matches
        searchWords.forEach(word => {
            const regexPattern = new RegExp(word, 'i'); //case-insensitive match
            matchConditions.push({
                $or: [
                    { title: { $regex: regexPattern }},
                    { description: { $regex: regexPattern }},
                    { "technologies.frontend": { $regex: regexPattern } },
                    { "technologies.backend": { $regex: regexPattern } },
                    { "technologies.design": { $regex: regexPattern } },
                    { "technologies.projectManagement": { $regex: regexPattern } },
                    { "technologies.devOps": { $regex: regexPattern } },
                    { "technologies.qualityAssurance": { $regex: regexPattern } },
                    { "technologies.database": { $regex: regexPattern } },
                    { rolesNeeded: { $regex: regexPattern } }
                ]
            });
        });
    }


    // make aggregation pipeline sorting projects
    const pipeline = matchConditions.length > 0 ? [
        {
            // Use $match with $and to ensure all regex conditions are met
            $match: {
                $and: matchConditions
            }
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
    ] : [
        {
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
            $skip: skip //implement pagination by skipping a certain number of documents to preserve correct pagination
        },
        {
            $limit: limit //limit the number of documents passed to the next stage to preserve correct pagination
        }
    ]

    //execute the aggregation pipeline
    let projects = await Project.aggregate(pipeline);

    //count total matching documents for pagination
    const totalProjects = await Project.countDocuments(search ? { $and: matchConditions } : {});
    
    //calculate total pages
    const totalPages = Math.ceil(totalProjects / limit);
    console.log(typeof search); //object
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

