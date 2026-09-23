const express = require("express");
const proposalController = require("../controllers/proposalController");

const {
  checkJobIsOpen,
  preventDuplicateProposal,
  canAccessProposal,
} = require("../middleware/proposalMiddleware");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/vaidateMiddleware");

const {createProposalSchema, updateProposalSchema, listProposalsSchema, myProposalsSchema, proposalIdSchema,} = require("../validators/proposalValidator");

const router = express.Router();

router.post(
  "/jobs/:jobId/proposals",
  protect, authorize("FREELANCER"), validate(createProposalSchema), checkJobIsOpen, preventDuplicateProposal,proposalController.createProposal);

router.get(
  "/jobs/:jobId/proposals",
  protect,
  authorize("CLIENT"),
  validate(listProposalsSchema),
  proposalController.listForJob
);

router.get(
  "/my",
  protect,
  authorize("FREELANCER"),
  validate(myProposalsSchema),
  proposalController.myProposals
);

router.get(     
  "/:id",
  protect,
  validate(proposalIdSchema),
  canAccessProposal,
  proposalController.getById
);

router.put(
  "/:id",
  protect,
  authorize("FREELANCER"),
  validate(updateProposalSchema),
  proposalController.updateProposal
);

router.delete(
  "/:id",
  protect,
  authorize("FREELANCER"),
  validate(proposalIdSchema),
  proposalController.withdrawProposal
);

router.post(
  "/:id/accept",
  protect,
  authorize("CLIENT"),
  validate(proposalIdSchema),
  proposalController.acceptProposal
);

router.post(
  "/:id/reject",
  protect,
  authorize("CLIENT"),
  validate(proposalIdSchema),
  proposalController.rejectProposal
);

module.exports = router;