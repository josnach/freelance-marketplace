const authService = require("../services/auth.js")
const asyncHandler = require("../utils/asyncHandler.js");

const register = asyncHandler(
  async (req, res) => {
    const result =
      await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result
    });
  }
);

const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;

    const result =
      await authService.login(
        email,
        password
      );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  }
);

const getMe = asyncHandler(
  async (req, res) => {
    const user =
      await authService.getMe(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  }
);

module.exports = {
  register,
  login,
  getMe
};