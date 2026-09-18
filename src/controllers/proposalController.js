const proposalService = require("../services/proposal.js");
const asyncHandler = require("../utils/asyncHandler.js");

const createProposal = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.createProposal(
        req.params.jobId,
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      data: {
        proposal
      }
    });
  }
);

const getJobProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getJobProposals(
        req.params.jobId,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals
      }
    });
  }
);

const getMyProposals = asyncHandler(
  async (req, res) => {
    const proposals =
      await proposalService.getMyProposals(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposals
      }
    });
  }
);

const getProposalById = asyncHandler(
  async (req, res) => {
    const proposal =
      await proposalService.getProposalById(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        proposal
      }
    });
  }
);

module.exports = {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById
};