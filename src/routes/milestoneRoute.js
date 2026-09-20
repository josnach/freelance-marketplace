const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  startMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone
} = require("../controllers/milestoneController");

const {
  createMilestoneSchema,
  updateMilestoneSchema,
  submitMilestoneSchema
} = require("../validators/milestoneValidator");

const router = express.Router();


/*
====================================================
PROJECT MILESTONES
====================================================
*/

/*
  Client creates milestone
*/
router.post(
  "/projects/:projectId/milestones",
  protect,
  authorize("CLIENT"),
  validate(createMilestoneSchema),
  createMilestone
);


/*
  Client or Freelancer views milestones
*/
router.get(
  "/projects/:projectId/milestones",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getProjectMilestones
);


/*
====================================================
SINGLE MILESTONE
====================================================
*/

router.get(
  "/milestones/:id",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getMilestoneById
);


/*
  Client updates milestone
*/
router.patch(
  "/milestones/:id",
  protect,
  authorize("CLIENT"),
  validate(updateMilestoneSchema),
  updateMilestone
);


/*
  Client deletes milestone
*/
router.delete(
  "/milestones/:id",
  protect,
  authorize("CLIENT"),
  deleteMilestone
);


/*
====================================================
FREELANCER ACTIONS
====================================================
*/

/*
  Freelancer starts milestone
*/
router.patch(
  "/milestones/:id/start",
  protect,
  authorize("FREELANCER"),
  startMilestone
);


/*
  Freelancer submits work
*/
router.patch(
  "/milestones/:id/submit",
  protect,
  authorize("FREELANCER"),
  validate(submitMilestoneSchema),
  submitMilestone
);


/*
====================================================
CLIENT ACTIONS
====================================================
*/

/*
  Client approves milestone
*/
router.patch(
  "/milestones/:id/approve",
  protect,
  authorize("CLIENT"),
  approveMilestone
);


/*
  Client rejects milestone
*/
router.patch(
  "/milestones/:id/reject",
  protect,
  authorize("CLIENT"),
  rejectMilestone
);


module.exports = router;