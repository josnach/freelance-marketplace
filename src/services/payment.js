const axios = require("axios");
const crypto = require("crypto");


const Milestone = require("../models/milestone.js");
const User = require("../models/user.js");
const AppError = require("../utils/AppError");
const Payment = require("../models/Payment.js");
const {  creditFreelancer} = require("./wallet.js");


const paystack = axios.create({
  baseURL:
    process.env.PAYSTACK_BASE_URL ||
    "https://api.paystack.co",

  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  }
});

const calculateFees = (amount) => {
  const clientFeePercent =
    Number(process.env.PLATFORM_CLIENT_FEE_PERCENT) || 5;

  const freelancerFeePercent =
    Number(
      process.env.PLATFORM_FREELANCER_FEE_PERCENT
    ) || 5;

  const clientFee =
    amount * (clientFeePercent / 100);

  const freelancerFee =
    amount * (freelancerFeePercent / 100);

  const freelancerNetAmount =
    amount - freelancerFee;

  return {
    clientFee,
    freelancerFee,
    freelancerNetAmount
  };
};

const initializeMilestonePayment = async ({
  milestoneId,
  clientId
}) => {
  const milestone = await Milestone.findById(
    milestoneId
  ).populate("project");

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  if (
    milestone.client.toString() !==
    clientId.toString()
  ) {
    throw new AppError(
      "You are not authorized to fund this milestone",
      403
    );
  }

  if (
    !["PENDING", "REVISION_REQUESTED"].includes(
      milestone.status
    )
  ) {
    throw new AppError(
      "This milestone cannot be funded",
      400
    );
  }

  const existingPayment =
    await Payment.findOne({
      milestone: milestone._id,
      status: {
        $in: [
          "PROCESSING",
          "FUNDED"
        ]
      }
    });

  if (existingPayment) {
    throw new AppError(
      "This milestone already has an active payment",
      400
    );
  }

  const client = await User.findById(clientId);

  if (!client) {
    throw new AppError(
      "Client not found",
      404
    );
  }

  const fees = calculateFees(
    milestone.amount
  );

  const totalClientCharge =
    milestone.amount + fees.clientFee;

  const reference =
    `FM-${milestone._id}-${crypto
      .randomBytes(6)
      .toString("hex")}`;

  const payment = await Payment.create({
    project: milestone.project._id,
    milestone: milestone._id,
    client: milestone.client,
    freelancer: milestone.freelancer,
    amount: milestone.amount,
    clientFee: fees.clientFee,
    freelancerFee: fees.freelancerFee,
    freelancerNetAmount:
      fees.freelancerNetAmount,
    currency: milestone.currency,
    status: "PROCESSING",
    provider: "PAYSTACK",
    providerReference: reference
  });

  try {
    const response = await paystack.post(
      "/transaction/initialize",
      {
        email: client.email,
        amount: Math.round(
          totalClientCharge * 100
        ),
        currency: milestone.currency,
        reference,
        metadata: {
          paymentId: payment._id.toString(),
          milestoneId:
            milestone._id.toString(),
          projectId:
            milestone.project._id.toString(),
          clientId:
            clientId.toString()
        }
      }
    );

    return {
      paymentId: payment._id,
      reference,
      authorizationUrl:
        response.data.data.authorization_url,
      accessCode:
        response.data.data.access_code,
      amount: milestone.amount,
      clientFee: fees.clientFee,
      totalClientCharge
    };
  } catch (error) {
    payment.status = "FAILED";
    await payment.save();

    console.error(
      "Paystack initialization error:",
      error.response?.data ||
        error.message
    );

    throw new AppError(
      "Unable to initialize payment",
      500
    );
  }
};

const verifyPayment = async (reference) => {
  const payment = await Payment.findOne({
    providerReference: reference
  });

  if (!payment) {
    throw new AppError(
      "Payment record not found",
      404
    );
  }

  const response = await paystack.get(
    `/transaction/verify/${reference}`
  );

  const transaction =
    response.data.data;

  if (
    transaction.status !== "success"
  ) {
    payment.status = "FAILED";
    await payment.save();

    throw new AppError(
      "Payment was not successful",
      400
    );
  }

  const expectedAmount =
    Math.round(
      (payment.amount +
        payment.clientFee) *
        100
    );

  if (
    Number(transaction.amount) !==
    expectedAmount
  ) {
    throw new AppError(
      "Payment amount mismatch",
      400
    );
  }

  payment.status = "FUNDED";
  payment.providerTransactionId =
    String(transaction.id);
  payment.paidAt = new Date();

  await payment.save();

  const milestone =
    await Milestone.findById(
      payment.milestone
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found",
      404
    );
  }

  milestone.status = "FUNDED";

  await milestone.save();

  return payment;
};


const releaseMilestonePayment =
  async (milestoneId) => {
    const milestone =
      await Milestone.findById(
        milestoneId
      );

    if (!milestone) {
      throw new AppError(
        "Milestone not found",
        404
      );
    }

    if (
      milestone.status !== "APPROVED"
    ) {
      throw new AppError(
        "Milestone must be approved before payment can be released",
        400
      );
    }

    const payment =
      await Payment.findOne({
        milestone: milestone._id,
        status: "FUNDED"
      });

    if (!payment) {
      throw new AppError(
        "Funded payment not found",
        404
      );
    }

    await creditFreelancer({
      userId:
        payment.freelancer,
      amount:
        payment.freelancerNetAmount,
      paymentId:
        payment._id,
      milestoneId:
        milestone._id,
      description:
        `Payment released for milestone ${milestone.title}`
    });

    payment.status =
      "RELEASED";

    payment.releasedAt =
      new Date();

    await payment.save();

    milestone.status =
      "RELEASED";

    milestone.releasedAt =
      new Date();

    await milestone.save();

    return {
      payment,
      milestone
    };
  };

module.exports = {
  initializeMilestonePayment,
  calculateFees,
  verifyPayment,
  releaseMilestonePayment
};
