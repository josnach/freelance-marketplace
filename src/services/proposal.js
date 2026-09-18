const Proposal = require("../models/proposal.js");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");

const createProposal = async (
  jobId,
  freelancerId,
  proposalData
) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.status !== "OPEN") {
    throw new AppError(
      "You can only apply to open jobs",
      400
    );
  }

  /*
    Prevent freelancer from applying
    to their own job.
  */
  if (
    job.client.toString() ===
    freelancerId.toString()
  ) {
    throw new AppError(
      "You cannot submit a proposal to your own job",
      400
    );
  }

  /*
    Check whether freelancer already
    submitted a proposal.
  */
  const existingProposal = await Proposal.findOne({
    job: jobId,
    freelancer: freelancerId
  });

  if (existingProposal) {
    throw new AppError(
      "You have already submitted a proposal for this job",
      409
    );
  }

  const proposal = await Proposal.create({
    job: jobId,
    freelancer: freelancerId,
    ...proposalData
  });

  return proposal;
};

const getJobProposals = async (jobId, clientId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  /*
    Only the client who created the job
    can see its proposals.
  */
  if (
    job.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You can only view proposals for your own jobs",
      403
    );
  }

  const proposals = await Proposal.find({
    job: jobId
  })
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .sort({ createdAt: -1 });

  return proposals;
};

const getMyProposals = async (freelancerId) => {
  const proposals = await Proposal.find({
    freelancer: freelancerId
  })
    .populate(
      "job",
      "title description budget budgetType deadline status"
    )
    .sort({ createdAt: -1 });

  return proposals;
};

const getProposalById = async (
  proposalId,
  userId
) => {
  const proposal = await Proposal.findById(
    proposalId
  )
    .populate(
      "freelancer",
      "name email avatar bio skills hourlyRate"
    )
    .populate(
      "job",
      "title description budget budgetType deadline status client"
    );

  if (!proposal) {
    throw new AppError("Proposal not found", 404);
  }

  const isFreelancer =
    proposal.freelancer._id.toString() ===
    userId.toString();

  const isClient =
    proposal.job.client.toString() ===
    userId.toString();

  if (!isFreelancer && !isClient) {
    throw new AppError(
      "You are not authorized to view this proposal",
      403
    );
  }

  return proposal;
};

module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById
};