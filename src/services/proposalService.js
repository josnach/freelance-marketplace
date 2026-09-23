const mongoose = require("mongoose");
const Proposal = require("../models/proposal");
const Job = require("../models/job");
const Project = require("../models/project");
//const ApiError = require("../utils/ApiError");

const createProposal = async ({ jobId, freelancerId, coverLetter, bidAmount, estimatedDuration }) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "OPEN") throw new ApiError(400, "This job is no longer accepting proposals");
  if (job.client.toString() === freelancerId.toString()) {
    throw new ApiError(403, "You cannot submit a proposal on your own job");
  }

  try {
    return await Proposal.create({
      job: jobId,
      freelancer: freelancerId,
      coverLetter,
      bidAmount,
      estimatedDuration,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "You have already submitted a proposal for this job");
    }
    throw err;
  }
};

const listForJob = async ({ jobId, clientId, page, limit }) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.client.toString() !== clientId.toString()) {
    throw new ApiError(403, "Only the job owner can view proposals for this job");
  }

  const skip = (page - 1) * limit;
  const [proposals, total] = await Promise.all([
    Proposal.find({ job: jobId })
      .populate("freelancer", "name skills hourlyRate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Proposal.countDocuments({ job: jobId }),
  ]);

  return {
    proposals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const myProposals = async ({ freelancerId, page, limit }) => {
  const skip = (page - 1) * limit;
  const [proposals, total] = await Promise.all([
    Proposal.find({ freelancer: freelancerId })
      .populate("job", "title budget status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Proposal.countDocuments({ freelancer: freelancerId }),
  ]);
  return { proposals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async ({ proposalId, userId }) => {
  const proposal = await Proposal.findById(proposalId).populate("job", "title client status");
  if (!proposal) throw new ApiError(404, "Proposal not found");

  const isFreelancer = proposal.freelancer.toString() === userId.toString();
  const isClient = proposal.job.client.toString() === userId.toString();
  if (!isFreelancer && !isClient) throw new ApiError(403, "You do not have access to this proposal");

  return proposal;
};

const updateProposal = async ({ proposalId, freelancerId, update }) => {
  const proposal = await Proposal.findOne({
    _id: proposalId,
    freelancer: freelancerId,
    status: "PENDING",
  });
  if (!proposal) throw new ApiError(404, "Proposal not found or can no longer be edited");
  Object.assign(proposal, update);
  return proposal.save();
};

const withdrawProposal = async ({ proposalId, freelancerId }) => {
  const proposal = await Proposal.findOne({
    _id: proposalId,
    freelancer: freelancerId,
    status: "PENDING",
  });
  if (!proposal) throw new ApiError(404, "Proposal not found or can no longer be withdrawn");
  proposal.status = "WITHDRAWN";
  return proposal.save();
};

const rejectProposal = async ({ proposalId, clientId }) => {
  const proposal = await Proposal.findById(proposalId).populate("job", "client status");
  if (!proposal) throw new ApiError(404, "Proposal not found");
  if (proposal.job.client.toString() !== clientId.toString()) {
    throw new ApiError(403, "Only the job owner can reject proposals");
  }
  if (proposal.status !== "PENDING") {
    throw new ApiError(400, `This proposal is already ${proposal.status.toLowerCase()}`);
  }
  proposal.status = "REJECTED";
  return proposal.save();
};

const acceptProposal = async ({ proposalId, clientId }) => {
  const proposal = await Proposal.findById(proposalId).populate("job");
  if (!proposal) throw new ApiError(404, "Proposal not found");
  if (proposal.job.client.toString() !== clientId.toString()) {
    throw new ApiError(403, "Only the job owner can accept proposals");
  }
  if (proposal.status !== "PENDING" || proposal.job.status !== "OPEN") {
    throw new ApiError(400, "This proposal can no longer be accepted");
  }

  const session = await mongoose.startSession();
  try {
    let project;
    await session.withTransaction(async () => {
      proposal.status = "ACCEPTED";
      await proposal.save({ session });

      await Proposal.updateMany(
        { job: proposal.job._id, _id: { $ne: proposal._id }, status: "PENDING" },
        { $set: { status: "REJECTED" } },
        { session }
      );

      proposal.job.status = "IN_PROGRESS";
      proposal.job.hiredFreelancer = proposal.freelancer;
      await proposal.job.save({ session });

      const [created] = await Project.create(
        [{
          job: proposal.job._id,
          proposal: proposal._id,
          client: proposal.job.client,
          freelancer: proposal.freelancer,
          title: proposal.job.title,
          description: proposal.job.description,
          budget: proposal.bidAmount,
          status: "ACTIVE",
        }],
        { session }
      );
      project = created;
    });
    return { proposal, project };
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createProposal,
  listForJob,
  myProposals,
  getById,
  updateProposal,
  withdrawProposal,
  rejectProposal,
  acceptProposal,
};