const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/payment.js");
const AppError = require("../utils/AppError.js");

const initializePayment = asyncHandler(
  async (req, res) => {
    const { milestoneId } = req.body;

    const result =
      await paymentService.initializeMilestonePayment(
        {
          milestoneId,
          clientId: req.user._id
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Payment initialized successfully",
      data: result
    });
  }
);

const verifyPayment =
  asyncHandler(
    async (req, res) => {
      const { reference } =
        req.body;

      const payment =
        await paymentService.verifyPayment(
          reference
        );

      res.status(200).json({
        success: true,
        message:
          "Payment verified successfully",
        data: {
          payment
        }
      });
    }
  );

  const releasePayment =
  asyncHandler(
    async (req, res) => {
      const { milestoneId } =
        req.body;

      const milestone =
        await require("../models/milestone.js")
          .findById(milestoneId);

      if (!milestone) {
       throw new AppError(
  "Milestone not found",
  404
);
      }

      if (
        milestone.client.toString() !==
        req.user._id.toString()
      ) {
     throw new AppError(
  "You are not authorized to release this payment",
  403
);
      }

      const result =
        await paymentService
          .releaseMilestonePayment(
            milestoneId
          );

      res.status(200).json({
        success: true,
        message:
          "Milestone payment released successfully",
        data: result
      });
    }
  );

module.exports = {
  initializePayment,
  verifyPayment,
  releasePayment
};