import { z } from "zod";
import { objectIdSchema } from "../middleware/validateRequest.js";

const sortBySchema = z
  .string()
  .regex(/^[a-zA-Z]+:(asc|desc)$/, "sortBy must follow field:asc|desc format")
  .optional();

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const accountStatusSchema = z.enum(["active", "suspended", "banned"]);
const userRoleSchema = z.enum(["user", "admin"]);
const eventStatusSchema = z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]);
const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled"]);
const eventPaymentStatusSchema = z.enum(["created", "paid", "failed", "cancelled", "refunded"]);

const notificationTypeSchema = z.enum(["announcement", "system", "event", "marketing", "urgent"]);
const notificationPrioritySchema = z.enum(["low", "normal", "high"]);
const notificationRecipientsSchema = z.enum(["all", "users", "admins", "specific"]);

export const adminGrowthQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(180).optional(),
});

export const adminSearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Query must be at least 2 characters"),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const adminUserListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  role: userRoleSchema.optional(),
  accountStatus: accountStatusSchema.optional(),
  sortBy: sortBySchema,
});

export const adminUserIdParamsSchema = z.object({
  userId: objectIdSchema,
});

export const adminUserRoleBodySchema = z.object({
  role: userRoleSchema,
});

export const adminUserStatusBodySchema = z.object({
  accountStatus: accountStatusSchema,
  reason: z.string().trim().max(300).optional(),
  note: z.string().trim().max(500).optional(),
});

export const adminUserNotificationBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(3).max(600),
  type: z.enum(["announcement", "system", "event", "marketing"]).optional(),
  priority: notificationPrioritySchema.optional(),
  actionUrl: z.string().trim().url("Invalid actionUrl").optional(),
});

export const adminEventListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  status: eventStatusSchema.optional(),
  category: z.string().trim().min(2).max(40).optional(),
  createdBy: objectIdSchema.optional(),
  dateFrom: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateFrom").optional(),
  dateTo: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateTo").optional(),
  sortBy: sortBySchema,
});

export const adminEventIdParamsSchema = z.object({
  eventId: objectIdSchema,
});

export const adminEventPaymentListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  status: eventPaymentStatusSchema.optional(),
  eventId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  dateFrom: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateFrom").optional(),
  dateTo: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateTo").optional(),
  sortBy: sortBySchema,
});

export const adminEventPaymentIdParamsSchema = z.object({
  paymentId: objectIdSchema,
});

export const adminEventStatusBodySchema = z.object({
  status: eventStatusSchema,
  note: z.string().trim().max(500).optional(),
});

export const adminEventFeaturedBodySchema = z.object({
  isFeatured: z.boolean(),
});

export const adminCommunityListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2).max(40).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  isPrivate: z.enum(["true", "false"]).optional(),
});

export const adminCommunityIdParamsSchema = z.object({
  communityId: objectIdSchema,
});

export const adminCommunityStatusBodySchema = z.object({
  isActive: z.boolean(),
  note: z.string().trim().max(500).optional(),
});

export const adminCommunityFeaturedBodySchema = z.object({
  isFeatured: z.boolean(),
});

export const adminVenueListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  isVerified: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  ownerId: objectIdSchema.optional(),
});

export const adminVenueIdParamsSchema = z.object({
  venueId: objectIdSchema,
});

export const adminVenueVerificationBodySchema = z.object({
  isVerified: z.boolean(),
  note: z.string().trim().max(500).optional(),
});

export const adminVenueStatusBodySchema = z.object({
  isActive: z.boolean(),
  note: z.string().trim().max(500).optional(),
});

export const adminVenueFeaturedBodySchema = z.object({
  isFeatured: z.boolean(),
});

export const adminBookingListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(2).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  status: bookingStatusSchema.optional(),
  venueId: objectIdSchema.optional(),
  dateFrom: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateFrom").optional(),
  dateTo: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateTo").optional(),
});

export const adminBookingParamsSchema = z.object({
  venueId: objectIdSchema,
  bookingId: objectIdSchema,
});

export const adminBookingStatusBodySchema = z.object({
  status: bookingStatusSchema,
});

export const adminNotificationListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["draft", "scheduled", "sent", "failed", "cancelled"]).optional(),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  search: z.string().trim().min(2).optional(),
});

export const adminNotificationRecipientsQuerySchema = z.object({
  search: z.string().trim().min(2).optional(),
  role: userRoleSchema.optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const adminNotificationCreateBodySchema = z.object({
  title: z.string().trim().min(3).max(200),
  message: z.string().trim().min(3).max(1000),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  recipients: notificationRecipientsSchema.optional(),
  specificRecipientIds: z.array(objectIdSchema).max(1000).optional(),
  metadata: z
    .object({
      actionUrl: z.string().trim().url("Invalid actionUrl").optional(),
      emailSent: z.boolean().optional(),
    })
    .passthrough()
    .optional(),
  scheduledAt: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid scheduledAt").optional(),
  sendNow: z.boolean().optional(),
});

export const adminNotificationIdParamsSchema = z.object({
  notificationId: objectIdSchema,
});

export const adminAuditLogsQuerySchema = paginationQuerySchema.extend({
  action: z.string().trim().max(120).optional(),
  entityType: z.enum(["user", "event", "community", "venue", "booking", "notification", "system"]).optional(),
  status: z.enum(["success", "failed"]).optional(),
  adminId: objectIdSchema.optional(),
  dateFrom: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateFrom").optional(),
  dateTo: z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid dateTo").optional(),
});
