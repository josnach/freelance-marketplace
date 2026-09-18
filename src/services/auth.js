const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const AppError = require("../utils/AppError");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

const register = async (userData) => {
  const {
    name,
    email,
    password,
    role
  } = userData;

  const existingUser = await User.findOne({
    email
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409
    );
  }

  /*
   * ADMIN accounts should not be created
   * through public registration.
   */
  if (role === "ADMIN") {
    throw new AppError(
      "Admin accounts cannot be created through registration",
      403
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      hourlyRate: user.hourlyRate,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    token
  };
};

const login = async (email, password) => {
  /*
   * password has select:false in the User model,
   * so we explicitly request it here.
   */
  const user = await User.findOne({ email }).select(
    "+password"
  );

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated",
      403
    );
  }

  const passwordIsCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordIsCorrect) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      hourlyRate: user.hourlyRate,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    token
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};

module.exports = {
  register,
  login,
  getMe,
  generateToken
};