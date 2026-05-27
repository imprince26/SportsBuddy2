import { z } from "zod";

export const notificationFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title is too short").max(200, "Title is too long"),
    message: z.string().trim().min(3, "Message is too short").max(1000, "Message is too long"),
    type: z.enum(["announcement", "system", "event", "marketing", "urgent"]),
    priority: z.enum(["low", "normal", "high"]),
    recipients: z.enum(["all", "users", "admins", "specific"]),
    specificRecipientIds: z.array(z.string()).default([]),
    scheduledAt: z.string().optional().or(z.literal("")),
    sendNow: z.boolean().default(false),
    metadata: z
      .object({
        actionUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
        emailSent: z.boolean().default(true),
      })
      .default({ actionUrl: "", emailSent: true }),
  })
  .superRefine((value, ctx) => {
    if (value.recipients === "specific" && value.specificRecipientIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one recipient",
        path: ["specificRecipientIds"],
      });
    }

    if (value.sendNow && value.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remove schedule time when sending immediately",
        path: ["scheduledAt"],
      });
    }
  });

export const userRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const userStatusSchema = z.object({
  accountStatus: z.enum(["active", "suspended", "banned"]),
  reason: z.string().trim().max(300, "Reason is too long").optional(),
  note: z.string().trim().max(500, "Note is too long").optional(),
});

export const userNotificationSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120, "Title is too long"),
  message: z.string().trim().min(3, "Message is too short").max(600, "Message is too long"),
  type: z.enum(["announcement", "system", "event", "marketing"]),
  priority: z.enum(["low", "normal", "high"]),
  actionUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
