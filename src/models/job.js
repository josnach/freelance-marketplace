const mongoose = require("mongoose")

const { Schema } = mongoose


// schema to get the freelancers that want the job
const jobApplcants = new Schema( {
    applcantDetails: { type: Schema.Types.ObjectId, ref: "User" },
    applcationDetails: { type: Schema.Types.ObjectId, ref: "Proposal" }
})

const jobSchema = new Schema({
    title: { type: String, maxLength: 1500, trim: true, minLength: 5, required: true },
    description: { type: String, maxLength: 2000, required: true, trim: true },
    budget: { type: String, required: true, default: "0.00" },
    jobstatus: { type: String, enum: ["CLOSED", "ACTIVE", "EXPIRED"] , default: "CLOSED" },
    duration: { type: String },
    acceptingMilestone: { type: Boolean, default: false},
    location: String,
    whoPostedJob: { type: Schema.Types.ObjectId, ref: "User"},
    listOfJobApplcants: [jobApplcants] // an array of the applicants to enable choice

},
{
    timestamps: true
})


// export the job schema
module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema)