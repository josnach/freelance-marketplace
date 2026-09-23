const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true 
  },
    freelancer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

    coverLetter: {
      type: String,
      required: [true, "Cover letter is required"],
      trim: true,
      minlength: 20,
      maxlength: 3000,
    },

    bidAmount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: 1, 
    },

    estimatedDays: {
      type: Number,
      required: [true, "Estimated duration is required"],
      min: 1,
      max: 365, 
    },

    attachments: [{ type: String }], 

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });
proposalSchema.index({ job: 1, status: 1 }); 

module.exports = mongoose.model("Proposal", proposalSchema);