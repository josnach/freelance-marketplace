const joi = require("joi")




// use to validate the req.body; making sure the data coming in are live and correct
// delete after if not in use
const createNewJobData = joi.object(
    {
        title: joi.string().min(5).max(1000).trim().required(),
        description: joi.string().max(1500).required(),
        budget: joi.string().required(),
        jobstatus: joi.string().valid("CLOSED", "ACTIVE", "EXPIRED").default("ACTIVE"),
        location: joi.string().required(),
        duration: joi.string().required()
    }
)


// used to validate the data that was seeded into the data base
// delete after if not needed
const validateSchema = joi.array().items({
    title: joi.string().min(5).max(1000).trim().required(),
    description: joi.string().max(1500).required(),
    budget: joi.string().required(),
    jobstatus: joi.string().valid("CLOSED", "ACTIVE", "EXPIRED").default("ACTIVE"),
    location: joi.string().required(),
    duration: joi.string().required()
})



const verifySchemaData = data => {
    return validateSchema.validate(data)
}

const verifyNewJobData = data => {
    return createNewJobData.validate(data)
}


module.exports = {
    verifySchemaData,
    verifyNewJobData
}
