const proposalService = require("../services/proposalService");
const catchAsync = require("../utils/asyncHandler");


const createProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.createProposal({
    jobId: req.params.jobId,
    freelancerId: req.user.id,
    coverLetter: req.body.coverLetter,
    bidAmount: req.body.bidAmount,
    estimatedDays: req.body.estimatedDays, 
    attachments: req.body.attachments,    
  });
  res.status(201).json(new ApiResponse(201, "Proposal submitted successfully", proposal));
});

const listForJob = catchAsync(async (req, res) => {
  const result = await proposalService.listForJob({
    jobId: req.params.jobId,
    clientId: req.user.id,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.json(new ApiResponse(200, "Proposals retrieved successfully", result));
});

const myProposals = catchAsync(async (req, res) => {
  const result = await proposalService.myProposals({
    freelancerId: req.user.id,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.json(new ApiResponse(200, "Your proposals retrieved successfully", result));
});

const getById = catchAsync(async (req, res) => {
  const proposal = await proposalService.getById({
    proposalId: req.params.id,
    userId: req.user.id,
  });
  res.json(new ApiResponse(200, "Proposal retrieved successfully", proposal));
});

const updateProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.updateProposal({
    proposalId: req.params.id,
    freelancerId: req.user.id,
    update: req.body,
  });
  res.json(new ApiResponse(200, "Proposal updated successfully", proposal));
});

const withdrawProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.withdrawProposal({
    proposalId: req.params.id,
    freelancerId: req.user.id,
  });
  res.json(new ApiResponse(200, "Proposal withdrawn successfully", proposal));
});

const rejectProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.rejectProposal({
    proposalId: req.params.id,
    clientId: req.user.id,
  });
  res.json(new ApiResponse(200, "Proposal rejected successfully", proposal));
});

const acceptProposal = catchAsync(async (req, res) => {
  const { proposal, project } = await proposalService.acceptProposal({
    proposalId: req.params.id,
    clientId: req.user.id,
  });
  res.status(201).json(
    new ApiResponse(201, "Proposal accepted. Project created successfully.", { proposal, project })
  );
});

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