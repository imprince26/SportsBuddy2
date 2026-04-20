import { z } from "zod";
import { objectIdSchema } from "../middleware/validateRequest.js";

export const eventPaymentParamsSchema = z.object({
  id: objectIdSchema,
});

export const verifyEventPaymentBodySchema = z.object({
  razorpay_order_id: z.string().trim().min(5),
  razorpay_payment_id: z.string().trim().min(5),
  razorpay_signature: z.string().trim().min(10),
});
