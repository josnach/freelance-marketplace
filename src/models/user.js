const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      maxlength: 72,
      select: false
    },

    role: {
      type: String,
      enum: ["ADMIN", "CLIENT", "FREELANCER"],
      default: "FREELANCER"
    },

    avatar: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: "",
      maxlength: 1000
    },

    location: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    hourlyRate: {
      type: Number,
      min: 0,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);