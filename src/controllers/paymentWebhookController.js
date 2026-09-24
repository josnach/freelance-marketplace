const mongoose = require("mongoose");

const Payment = require("../models/Payment.js");


const WebhookEvent = require("../models/WebhookEvent");

const {
  verifyPaystackSignature,
} = require("../services/paymentWebhook.js");
const project = require("../models/project.js");
const milestone = require("../models/milestone.js");

const handlePaystackWebhook = async (req, res) => {
  try {
    /*
     * 1. Verify that the request actually came from Paystack
     */
    const validSignature = verifyPaystackSignature(req);

    if (!validSignature) {
      return res.status(401).json({
        success: false,
        message: "Invalid Paystack signature",
      });
    }

    const event = req.body;

    /*
     * Paystack events normally contain:
     *
     * {
     *   event: "charge.success",
     *   data: {...}
     * }
     */

    const eventName = event.event;
    const data = event.data;

    if (!eventName || !data) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    /*
     * 2. Only process successful charges here
     */
    if (eventName !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Event received",
      });
    }

    const reference = data.reference;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference missing",
      });
    }

    /*
     * 3. Idempotency
     */

    const existingEvent = await WebhookEvent.findOne({
      reference,
      event: eventName,
      processed: true,
    });

    if (existingEvent) {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed",
      });
    }

    /*
     * 4. Locate our payment
     */

    const payment = await Payment.findOne({
      reference,
    });

    if (!payment) {
      /*
       * Don't keep retrying an event that belongs
       * to another integration/payment.
       */
      return res.status(200).json({
        success: true,
        message: "Payment not found in marketplace",
      });
    }

    /*
     * 5. Make sure the amount matches.
     *
     * Paystack returns amount in kobo.
     */

    const expectedAmount = payment.amount * 100;

    if (Number(data.amount) !== Number(expectedAmount)) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    /*
     * 6. Prevent duplicate payment processing
     */

    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already successful",
      });
    }

    /*
     * 7. Start database transaction
     */

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        payment.status = "SUCCESS";
        payment.paidAt = new Date();

        await payment.save({ session });

        /*
         * Fund the project
         */

        await project.findByIdAndUpdate(
          payment.project,
          {
            $set: {
              status: "IN_PROGRESS",
              funded: true,
              fundedAt: new Date(),
            },
          },
          {
            session,
          }
        );

        /*
         * Activate the first milestone
         */

        await milestone.findOneAndUpdate(
          {
            project: payment.project,
            status: "PENDING",
          },
          {
            $set: {
              status: "ACTIVE",
              activatedAt: new Date(),
            },
          },
          {
            session,
            sort: {
              order: 1,
            },
          }
        );

        await WebhookEvent.create(
          [
            {
              eventId:
                data.id ||
                `${eventName}-${reference}`,

              event: eventName,

              reference,

              processed: true,

              processedAt: new Date(),

              payload: event,
            },
          ],
          {
            session,
          }
        );
      });
    } finally {
      await session.endSession();
    }

    /*
     * 8. Acknowledge Paystack
     */

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  handlePaystackWebhook,
};