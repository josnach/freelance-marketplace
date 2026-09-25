const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.js");

/*
====================================================
UPDATE MY OWN PROFILE
====================================================
*/
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

/*
====================================================
BROWSE / SEARCH FREELANCERS
====================================================
*/
const listFreelancers = asyncHandler(async (req, res) => {
  const result = await userService.listFreelancers({
    skill: req.query.skill,
    search: req.query.search,
    minRating: req.query.minRating,
    page: req.query.page,
    limit: req.query.limit,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/*
====================================================
GET A USER'S PUBLIC PROFILE
====================================================
*/
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getPublicProfile(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/*
====================================================
GET A USER'S PUBLIC REVIEWS
====================================================
*/
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await userService.getUserReviews(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { reviews },
  });
});

module.exports = {
  updateMyProfile,
  listFreelancers,
  getUserById,
  getUserReviews,
};
