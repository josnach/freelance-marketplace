const Wallet = require("../models/wallet.js");
const Transaction = require("../models/transaction.js");
const AppError = require("../utils/AppError");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({
    user: userId
  });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId
    });
  }

  return wallet;
};

const creditFreelancer = async ({
  userId,
  amount,
  paymentId,
  milestoneId,
  description
}) => {
  if (amount <= 0) {
    throw new AppError(
      "Credit amount must be greater than zero",
      400
    );
  }

  const wallet = await getOrCreateWallet(userId);

  wallet.availableBalance += amount;
  wallet.totalEarned += amount;

  await wallet.save();

  await Transaction.create({
    user: userId,
    type: "MILESTONE_EARNING",
    direction: "CREDIT",
    amount,
    description,
    payment: paymentId,
    milestone: milestoneId,
    reference: `EARN-${paymentId}-${Date.now()}`,
    status: "COMPLETED"
  });

  return wallet;
};

const debitWallet = async ({
  userId,
  amount,
  type,
  description
}) => {
  const wallet = await getOrCreateWallet(userId);

  if (wallet.availableBalance < amount) {
    throw new AppError(
      "Insufficient wallet balance",
      400
    );
  }

  wallet.availableBalance -= amount;

  if (type === "WITHDRAWAL") {
    wallet.totalWithdrawn += amount;
  }

  await wallet.save();

  await Transaction.create({
    user: userId,
    type,
    direction: "DEBIT",
    amount,
    description,
    reference: `DEBIT-${userId}-${Date.now()}`,
    status: "COMPLETED"
  });

  return wallet;
};

module.exports = {
  getOrCreateWallet,
  creditFreelancer,
  debitWallet
};