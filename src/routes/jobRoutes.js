const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

const {
  createJobSchema,
  updateJobSchema,
} = require("../validators/jobValidator");

const router = express.Router();

/*
  Client posts a new job
*/
router.post(
  "/",
  protect,
  authorize("CLIENT"),
  validate(createJobSchema),
  createJob
);

/*
  Anyone authenticated can browse open jobs
*/
router.get("/", protect, getJobs);

/*
  Client views their own posted jobs
  NOTE: registered before "/:id" so "my" isn't
  swallowed by the :id param route
*/
router.get("/my", protect, authorize("CLIENT"), getMyJobs);

router.get("/:id", protect, getJobById);

router.patch(
  "/:id",
  protect,
  authorize("CLIENT"),
  validate(updateJobSchema),
  updateJob
);

router.delete("/:id", protect, authorize("CLIENT"), deleteJob);

module.exports = router;
