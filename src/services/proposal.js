const Proposal = require("../models/Proposal");
const Job = require("../models/Job");
const Project = require("../models/Project");
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

  if (
    job.client.toString() === freelancerId.toString()
  ) {
    throw new AppError(
      "You cannot submit a proposal to your own job",
      400
    );
  }

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

const getJobProposals = async (
  jobId,
  clientId
) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

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

const getMyProposals = async (
  freelancerId
) => {
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
    throw new AppError(
      "Proposal not found",
      404
    );
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


/*

ACCEPT PROPOSAL

*/

const acceptProposal = async (
  proposalId,
  clientId
) => {
  const proposal = await Proposal.findById(
    proposalId
  ).populate("job");

  if (!proposal) {
    throw new AppError(
      "Proposal not found",
      404
    );
  }

  const job = proposal.job;

  /*
    Make sure this client owns the job.
  */
  if (
    job.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You can only accept proposals for your own jobs",
      403
    );
  }

  /*
    Job must still be open.
  */
  if (job.status !== "OPEN") {
    throw new AppError(
      "This job is no longer open",
      400
    );
  }

  /*
    Proposal must still be pending.
  */
  if (proposal.status !== "PENDING") {
    throw new AppError(
      "Only pending proposals can be accepted",
      400
    );
  }

  /*
    Make sure a project doesn't already exist.
  */
  const existingProject = await Project.findOne({
    job: job._id
  });

  if (existingProject) {
    throw new AppError(
      "A project already exists for this job",
      409
    );
  }

  /*
    Accept selected proposal.
  */
  proposal.status = "ACCEPTED";
  await proposal.save();

  /*
    Reject all other pending proposals
    for the same job.
  */
  await Proposal.updateMany(
    {
      job: job._id,
      _id: { $ne: proposal._id },
      status: "PENDING"
    },
    {
      $set: {
        status: "REJECTED"
      }
    }
  );

  /*
    Change job status.
  */
  job.status = "IN_PROGRESS";
  await job.save();

  /*
    Create project.
  */
  const project = await Project.create({
    job: job._id,
    proposal: proposal._id,
    client: job.client,
    freelancer: proposal.freelancer,
    title: job.title,
    description: job.description,
    budget: proposal.bidAmount,
    status: "ACTIVE"
  });

  return {
    proposal,
    project
  };
};


/*

REJECT PROPOSAL

*/

const rejectProposal = async (
  proposalId,
  clientId
) => {
  const proposal = await Proposal.findById(
    proposalId
  ).populate("job");

  if (!proposal) {
    throw new AppError(
      "Proposal not found",
      404
    );
  }

  const job = proposal.job;

  if (
    job.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You can only reject proposals for your own jobs",
      403
    );
  }

  if (proposal.status !== "PENDING") {
    throw new AppError(
      "Only pending proposals can be rejected",
      400
    );
  }

  proposal.status = "REJECTED";

  await proposal.save();

  return proposal;
};


module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById,
  acceptProposal,
  rejectProposal
};