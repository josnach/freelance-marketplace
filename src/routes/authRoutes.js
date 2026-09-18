const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController.js");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidator.js");

const router = express.Router();

/*
 * Public registration
 */
router.post(
  "/register",
  validate(registerSchema),
  register
);

/*
 * Public login
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);

/*
 * Get currently authenticated user
 */
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;