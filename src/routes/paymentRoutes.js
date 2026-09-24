const express = require("express");

const {
  initializePayment,
  verifyPayment,
  releasePayment
} = require("../controllers/paymentController.js");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  initializePaymentSchema
} = require("../validators/paymentValidator.js");

const router = express.Router();

router.post(
  "/initialize",
  protect,
  validate(initializePaymentSchema),
  initializePayment
);

router.post(
  "/verify",
  protect,
  verifyPayment
);

router.post(
  "/release",
  protect,
  releasePayment
);

module.exports = router;