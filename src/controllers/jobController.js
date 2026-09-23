const asyncHandler = require("../utils/asyncHandler.js");
const CJobServices = require("../services/job.js")


const useInstanceOfJobClass = new CJobServices()

const showAllPostedJobs = asyncHandler(
    async (req,res) => {

        const data = await useInstanceOfJobClass.getAllJobs(req.query)

        res.status(200).json({
            success: true,
            message: "Showing All Posted Jobs",
            data: data
        })
    }
)

const showAParticularJob = asyncHandler(
    async (req,res) => {
        const data = await useInstanceOfJobClass.getAParticularJob(req.params)


        res.status(200).json({
            success: true,
            meassage: "Showing posted Job",
            data: data
        })
    }
)

const postNewJob = asyncHandler(
    async (req,res) => {
        try {
            const data = await useInstanceOfJobClass.postANewJob(req.body)

            res.status(201).json({
                success: true,
                message: "New job created successfully",
                data: data
            })
        } catch (err) {
            res.status(401).json({
                success: true,
                message: "Error creating Job",
                Error: err
            })
        }
    }
)

const deletePostedJob = asyncHandler(
    async (req,res) => {
        const data = await useInstanceOfJobClass.deleteJob(req.params)

        res.status(200).json({
                success: true,
                message: "job Deleted Successfully",
                data: data
            })
    }
)

const editPostedJob = asyncHandler(
    async (req,res) => {
        try {
            const data = await useInstanceOfJobClass.editJobDetails(req.body,req.params)

            res.status(201).json({
                success: true,
                message: "Posted job editted successfully",
                data: data
            })
        } catch (err) {
            res.status(400).json({
                success: false,
                message: "Failed to edit job",
                Error: err
            })
        }
    }
)

// use PATCH METHOD 

const patchEditPostedJob = asyncHandler(
    async (req,res) => {
        try {
            const data = await useInstanceOfJobClass.patchEditJobDetails(req.body,req.params)

            res.status(200).json({
                success: true,
                message: "Successfully editted job",
                data: data
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to edit the job, try again",
                Error: "Error message:" + ' ' + error.message,
                data: req.body
            })
        }
    }
)

module.exports = {
    showAllPostedJobs,
    showAParticularJob,
    postNewJob,
    deletePostedJob,
    editPostedJob,
    patchEditPostedJob
}