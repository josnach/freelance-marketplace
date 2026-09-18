const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById
} = require("../controllers/proposal.controller");

const {
  createProposalSchema
} = require("../validators/proposal.validator");

const router = express.Router();

/*
  Freelancer submits proposal
*/
router.post(
  "/jobs/:jobId/proposals",
  protect,
  authorize("FREELANCER"),
  validate(createProposalSchema),
  createProposal
);

/*
  Client views proposals for their job
*/
router.get(
  "/jobs/:jobId/proposals",
  protect,
  authorize("CLIENT"),
  getJobProposals
);

/*
  Freelancer views their own proposals
*/
router.get(
  "/proposals/my",
  protect,
  authorize("FREELANCER"),
  getMyProposals
);

/*
  Client or Freelancer can view
  a proposal they are involved with.
*/
router.get(
  "/proposals/:id",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getProposalById
);

module.exports = router;