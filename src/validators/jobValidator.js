const { z } = require("zod");

const postNewJobValidator = z.object({
    title: z.string().min(2,"title must be more than 2 word").max(1500).trim(),
    description: z.string().min(2,"description must be more than 2 word").max(1500,"description must not exceed 1500 words").trim(),
    budget: z.string().min(2).max(1500).trim(),
    jobstatus: z.enum(["CLOSED", "ACTIVE", "EXPIRED"]).default("ACTIVE"),
    location: z.string().min(2).max(100).trim(),
    duration: z.string().min(2)
})

const validateSchema = z.array(
  z.object({
    title: z.string().trim().min(5).max(1000),
    description: z.string().max(1500),
    budget: z.string(),
    jobstatus: z.enum(["CLOSED", "ACTIVE", "EXPIRED"]).default("ACTIVE"),
    location: z.string(),
    duration: z.string()
  })
);

const validateSchemaParse = data => validateSchema.parse(data)

const postNewJobValidatorParse = data => postNewJobValidator.parse(data)


module.exports = {
    postNewJobValidatorParse,
    validateSchemaParse
}