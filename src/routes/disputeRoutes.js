const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");

const {
  openDispute,
  resolveDispute,
} = require("../controllers/disputeController.js");

router.post(
  "/milestones/:milestoneId/dispute",
  protect,
  openDispute
);

router.patch(
  "/disputes/:disputeId/resolve",
  protect,
  authorize("ADMIN"),
  resolveDispute
);

module.exports = router;