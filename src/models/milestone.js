const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    title: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150
    },

    description: {
      type: String,
      required: [true, "Milestone description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000
    },

    amount: {
      type: Number,
      required: [true, "Milestone amount is required"],
      min: 0
    },

    dueDate: {
      type: Date,
      required: [true, "Milestone due date is required"]
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "APPROVED",
        "REJECTED"
      ],
      default: "PENDING"
    },

    submission: {
      type: String,
      default: "",
      maxlength: 3000
    },

    submittedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

milestoneSchema.index({
  project: 1,
  status: 1
});

module.exports = mongoose.model(
  "Milestone",
  milestoneSchema
);