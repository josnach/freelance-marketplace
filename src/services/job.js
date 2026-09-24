const JobSchema = require("../models/job")
const { postNewJobValidatorParse } = require("../validators/jobValidator")



class CJobServices {
    // get all jobs by page and limit 
    async getAllJobs (query) {
        try{

            let { page, limit } = query

            if(!page) {
                page = 1
            }

            if(!limit) {
                limit = 10
            }

            const skip = (JSON.parse(page) - 1) * JSON.parse(limit)
            

            // const options = {
            //     skip: skip,
            //     limit: JSON.parse(limit) 
            // }

            // find a way to filter
            const findPostedJobs = await JobSchema.aggregate([
                {
                    $facet: {
                    // Track A: Get the total count
                    totalCount: [
                        { $count: 'count' }
                    ],
                        // Track B: Get the actual paginated data
                        paginatedData: [
                            { $skip: skip },
                            { $limit: Number(limit) }
                        ]
                    }
                },

                // 3. Format the output so it's clean and easy to use
                {
                    $project: {
                    total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
                    data: '$paginatedData'
                    }
                }
            ])

            const totalItemsPage = Math.ceil(findPostedJobs[0].total / limit)
            const totalItems = findPostedJobs[0].total

            if(!findPostedJobs) {
                throw new Error("no jobs posted yet")
            }

            return {
                page: JSON.parse(page),
                limit: JSON.parse(limit),
                total: totalItems,
                totalPage: totalItemsPage,
                data: findPostedJobs[0].data
            }

        }catch(err) {
            console.log(err)
        }
    }

    // get job by a particular :id
    async getAParticularJob (params) {
        try{
            const { id } = params

            const findParticularJob = await JobSchema.findById(id)

            if(!findParticularJob) {
                throw new Error("can't find the posted job")
            }

            return findParticularJob

        }catch(err) {
            console.log(err)
        }
    }

    // post new job 
    async postANewJob(body) {
        try{
            const result = postNewJobValidatorParse(body)

            if(result.rror) {
                throw new Error(result.error)
            }

            const {title,description,budget,jobstatus,location,duration} = result

            const data = await JobSchema.create({
                title,
                description,
                budget,
                jobstatus,
                location,
                duration
            })

            return data
        }catch(err) {
            console.log(err)
        }
    }

    // delete job by :id
    async deleteJob(params) {
        try {
            const { id } = params

            await JobSchema.deleteOne({_id: id})

            return "Success"
        } catch (err) {
            console.log(err)
        }
    }

    // edit job using PUT METHOD
    async editJobDetails(body,params){
        try {

            // get the job id to edit
            const { id } = params

            // get the body of the request
            const { title, description, budget, jobstatus, location, duration } = body

            const jobToEditNewDetails = await JobSchema.findOne({ _id: id})

            if(!jobToEditNewDetails) throw new Error("No job found, check the details and try again")

            jobToEditNewDetails.title = title || jobToEditNewDetails.title
            jobToEditNewDetails.description = description || jobToEditNewDetails.description;
            jobToEditNewDetails.budget = budget || jobToEditNewDetails.budget;
            jobToEditNewDetails.jobstatus = jobstatus || jobToEditNewDetails.jobstatus;
            jobToEditNewDetails.location = location || jobToEditNewDetails.location;
            jobToEditNewDetails.duration = duration || jobToEditNewDetails.duration;

            await jobToEditNewDetails.save()

            return jobToEditNewDetails

        } catch (err) {
            throw new Error(err)
        }
    }

    // edit job using PATCH METHOD
    async patchEditJobDetails(body,params){
        try {
            // get the job id to edit
            const { id } = params

            // get the body of the request
            const newDetailsToEdit = body

            const jobToEditNewDetails = await JobSchema.findOne({ _id: id})

            if(!jobToEditNewDetails) throw new Error("No job found, check the details and try again")

            for(const key in jobToEditNewDetails) {
                if (Object.prototype.hasOwnProperty.call(newDetailsToEdit, key)) jobToEditNewDetails[key] = newDetailsToEdit[key]
            }

            // await jobToEditNewDetails.save()

            return jobToEditNewDetails
        } catch (error) {
            throw new Error(error.message)
        }
    }
}








// accept job proposal
const acceptJobProposal = async () => {}

module.exports = CJobServices