import crypto from "crypto";
import Razorpay from "razorpay";

let razorpayClient;

export const getRazorpayClient = () => {
  if (razorpayClient) {
    return razorpayClient;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayClient;
};

export const toPaise = (rupees) => {
  const numericValue = Number(rupees);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error("Invalid amount");
  }

  return Math.round(numericValue * 100);
};

export const formatINR = (rupees) => {
  const amount = Number(rupees) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateRazorpaySignature = (orderId, paymentId, keySecret = process.env.RAZORPAY_KEY_SECRET) => {
  if (!orderId || !paymentId || !keySecret) {
    return "";
  }

  const payload = `${orderId}|${paymentId}`;
  return crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
};

export const verifyRazorpayPaymentSignature = ({
  orderId,
  paymentId,
  signature,
  keySecret = process.env.RAZORPAY_KEY_SECRET,
}) => {
  if (!orderId || !paymentId || !signature || !keySecret) {
    return false;
  }

  const expectedSignature = generateRazorpaySignature(orderId, paymentId, keySecret);
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

export const verifyRazorpayWebhookSignature = ({
  body,
  signature,
  webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET,
}) => {
  if (!body || !signature || !webhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};
