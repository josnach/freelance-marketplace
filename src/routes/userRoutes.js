const express = require("express");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  updateMyProfile,
  listFreelancers,
  getUserById,
  getUserReviews,
} = require("../controllers/userController");

const {
  updateProfileSchema,
} = require("../validators/userValidator");

const router = express.Router();

/*
  Update my own profile.
  NOTE: registered before "/:id" so "me" isn't
  swallowed by the :id param route.

  (Viewing your own profile is already served by
  GET /api/auth/me.)
*/
router.patch(
  "/me",
  protect,
  validate(updateProfileSchema),
  updateMyProfile
);

/*
  Browse / search freelancers
*/
router.get("/", protect, listFreelancers);

router.get("/:id", protect, getUserById);

router.get("/:id/reviews", protect, getUserReviews);

module.exports = router;
