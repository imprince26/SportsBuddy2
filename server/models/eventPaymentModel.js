import mongoose from "mongoose";

const eventPaymentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gateway: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cancelled", "refunded"],
      default: "created",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    receipt: {
      type: String,
      trim: true,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    webhookEvents: [
      {
        event: { type: String, trim: true },
        at: { type: Date, default: Date.now },
        payload: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventPaymentSchema.index({ event: 1, user: 1, createdAt: -1 });
eventPaymentSchema.index({ status: 1, createdAt: -1 });
eventPaymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

const EventPayment = mongoose.model("EventPayment", eventPaymentSchema);

export default EventPayment;
