const Project = require("../models/Project");
const asyncWrapper = require("../middleware/async-wrapper");
const { StatusCodes } = require("http-status-codes");

const displaySearchProjects = asyncWrapper(async (req, res) => {
    let { page, limit, search } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    if (search) {
        const searchWords = search.split(" ");
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
                
                    return {
                        //convert to a plain object to add a custom property which is outside the scope of database operations
                        ...project.toObject(), 
                        missingWords 
                    };
                });
                
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

        res.status(StatusCodes.OK).json({
            count: projects.length,
            totalPages,
            page,
            limit,
            data: projects,
        });
    }
});

module.exports =  { displaySearchProjects };

