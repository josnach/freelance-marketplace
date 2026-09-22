const crypto = require("crypto");

const verifyPaystackSignature = (req) => {
  const signature = req.headers["x-paystack-signature"];

  if (!signature || !req.rawBody) {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
};

module.exports = {
  verifyPaystackSignature,
};