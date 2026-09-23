const Job = require("../models/job");
const Proposal = require("../models/proposal");
const catchAsync = require("../utils/asyncHandler");


const checkJobIsOpen = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "OPEN") throw new ApiError(400, "This job is no longer accepting proposals");
  req.job = job;
  next();
});


const preventDuplicateProposal = catchAsync(async (req, res, next) => {
  const existing = await Proposal.findOne({
    job: req.params.jobId,
    freelancer: req.user.id,
  });
  if (existing) {
    throw new ApiError(409, "You have already submitted a proposal for this job");
  }
  next();
});


const canAccessProposal = catchAsync(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id).populate("job", "client");
  if (!proposal) throw new ApiError(404, "Proposal not found");

  const isOwner = proposal.freelancer.toString() === req.user.id;
  const isJobClient = proposal.job.client.toString() === req.user.id;

  if (req.user.role === "FREELANCER" && !isOwner) {
    throw new ApiError(403, "You can only access your own proposals");
  }
  if (req.user.role === "CLIENT" && !isJobClient) {
    throw new ApiError(403, "Only the job owner can access this proposal");
  }
  if (req.user.role !== "FREELANCER" && req.user.role !== "CLIENT" && req.user.role !== "ADMIN") {
    throw new ApiError(403, "Insufficient permission");
  }

  req.proposal = proposal;
  next();
});

module.exports = { checkJobIsOpen, preventDuplicateProposal, canAccessProposal };