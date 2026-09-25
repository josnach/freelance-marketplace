const asyncHandler = require("../utils/asyncHandler");
const jobService = require("../services/job.js");

/*
====================================================
CREATE JOB
CLIENT ONLY
====================================================
*/
const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(
    req.user._id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Job posted successfully",
    data: { job },
  });
});

/*
====================================================
BROWSE OPEN JOBS (public to any authenticated user)
Supports optional ?category= and ?skill= filters
====================================================
*/
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getJobs({
    category: req.query.category,
    skill: req.query.skill,
  });

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

/*
====================================================
GET MY POSTED JOBS
CLIENT ONLY
====================================================
*/
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getMyJobs(req.user._id);

  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

/*
====================================================
GET JOB BY ID
====================================================
*/
const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);

  res.status(200).json({
    success: true,
    data: { job },
  });
});

/*
====================================================
UPDATE JOB
CLIENT (owner) ONLY - only while still OPEN
====================================================
*/
const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    data: { job },
  });
});

/*
====================================================
CANCEL / DELETE JOB
CLIENT (owner) ONLY - only while still OPEN
====================================================
*/
const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

module.exports = {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
};
