const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  sendMessage,
  getProjectMessages,
} = require("../controllers/messageController.js");

const {
  sendMessageSchema,
} = require("../validators/messageValidator.js");

const router = express.Router();

router.post(
  "/projects/:projectId/messages",
  protect,
  validate(sendMessageSchema),
  sendMessage
);

router.get(
  "/projects/:projectId/messages",
  protect,
  getProjectMessages
);

module.exports = router;
