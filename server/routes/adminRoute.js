import express from "express";
import {
  getAdminDashboardOverview,
  getAdminGrowthAnalytics,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserRole,
  updateAdminUserStatus,
  getAdminEvents,
  getAdminEventPayments,
  getAdminEventPaymentDetails,
  updateAdminEventStatus,
  updateAdminEventFeatured,
  deleteAdminEvent,
  getAdminCommunities,
  updateAdminCommunityStatus,
  updateAdminCommunityFeatured,
  deleteAdminCommunity,
  getAdminVenues,
  updateAdminVenueVerification,
  updateAdminVenueStatus,
  updateAdminVenueFeatured,
  getAdminBookings,
  updateAdminBookingStatus,
  getAdminNotificationRecipients,
  getAdminNotifications,
  createAdminNotification,
  sendAdminNotification,
  getAdminAuditLogs,
  adminGlobalSearch,
  getAdminSystemHealth,
} from "../controllers/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import {
  adminReadLimiter,
  adminWriteLimiter,
  notificationSendLimiter,
} from "../middleware/rateLimitMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminGrowthQuerySchema,
  adminSearchQuerySchema,
  adminUserListQuerySchema,
  adminUserIdParamsSchema,
  adminUserRoleBodySchema,
  adminUserStatusBodySchema,
  adminEventListQuerySchema,
  adminEventIdParamsSchema,
  adminEventPaymentListQuerySchema,
  adminEventPaymentIdParamsSchema,
  adminEventStatusBodySchema,
  adminEventFeaturedBodySchema,
  adminCommunityListQuerySchema,
  adminCommunityIdParamsSchema,
  adminCommunityStatusBodySchema,
  adminCommunityFeaturedBodySchema,
  adminVenueListQuerySchema,
  adminVenueIdParamsSchema,
  adminVenueVerificationBodySchema,
  adminVenueStatusBodySchema,
  adminVenueFeaturedBodySchema,
  adminBookingListQuerySchema,
  adminBookingParamsSchema,
  adminBookingStatusBodySchema,
  adminNotificationListQuerySchema,
  adminNotificationRecipientsQuerySchema,
  adminNotificationCreateBodySchema,
  adminNotificationIdParamsSchema,
  adminAuditLogsQuerySchema,
} from "../validators/adminValidators.js";

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/dashboard/overview", adminReadLimiter, getAdminDashboardOverview);
router.get(
  "/dashboard/growth",
  adminReadLimiter,
  validateRequest({ query: adminGrowthQuerySchema }),
  getAdminGrowthAnalytics
);
router.get("/search", adminReadLimiter, validateRequest({ query: adminSearchQuerySchema }), adminGlobalSearch);
router.get("/system/health", adminReadLimiter, getAdminSystemHealth);

router.get("/users", adminReadLimiter, validateRequest({ query: adminUserListQuerySchema }), getAdminUsers);
router.get(
  "/users/:userId",
  adminReadLimiter,
  validateRequest({ params: adminUserIdParamsSchema }),
  getAdminUserDetails
);
router.patch(
  "/users/:userId/role",
  adminWriteLimiter,
  validateRequest({ params: adminUserIdParamsSchema, body: adminUserRoleBodySchema }),
  updateAdminUserRole
);
router.patch(
  "/users/:userId/status",
  adminWriteLimiter,
  validateRequest({ params: adminUserIdParamsSchema, body: adminUserStatusBodySchema }),
  updateAdminUserStatus
);

router.get("/events", adminReadLimiter, validateRequest({ query: adminEventListQuerySchema }), getAdminEvents);
router.get(
  "/event-payments",
  adminReadLimiter,
  validateRequest({ query: adminEventPaymentListQuerySchema }),
  getAdminEventPayments
);
router.get(
  "/event-payments/:paymentId",
  adminReadLimiter,
  validateRequest({ params: adminEventPaymentIdParamsSchema }),
  getAdminEventPaymentDetails
);
router.patch(
  "/events/:eventId/status",
  adminWriteLimiter,
  validateRequest({ params: adminEventIdParamsSchema, body: adminEventStatusBodySchema }),
  updateAdminEventStatus
);
router.patch(
  "/events/:eventId/featured",
  adminWriteLimiter,
  validateRequest({ params: adminEventIdParamsSchema, body: adminEventFeaturedBodySchema }),
  updateAdminEventFeatured
);
router.delete(
  "/events/:eventId",
  adminWriteLimiter,
  validateRequest({ params: adminEventIdParamsSchema }),
  deleteAdminEvent
);

router.get(
  "/communities",
  adminReadLimiter,
  validateRequest({ query: adminCommunityListQuerySchema }),
  getAdminCommunities
);
router.patch(
  "/communities/:communityId/status",
  adminWriteLimiter,
  validateRequest({ params: adminCommunityIdParamsSchema, body: adminCommunityStatusBodySchema }),
  updateAdminCommunityStatus
);
router.patch(
  "/communities/:communityId/featured",
  adminWriteLimiter,
  validateRequest({ params: adminCommunityIdParamsSchema, body: adminCommunityFeaturedBodySchema }),
  updateAdminCommunityFeatured
);
router.delete(
  "/communities/:communityId",
  adminWriteLimiter,
  validateRequest({ params: adminCommunityIdParamsSchema }),
  deleteAdminCommunity
);

router.get("/venues", adminReadLimiter, validateRequest({ query: adminVenueListQuerySchema }), getAdminVenues);
router.patch(
  "/venues/:venueId/verification",
  adminWriteLimiter,
  validateRequest({ params: adminVenueIdParamsSchema, body: adminVenueVerificationBodySchema }),
  updateAdminVenueVerification
);
router.patch(
  "/venues/:venueId/status",
  adminWriteLimiter,
  validateRequest({ params: adminVenueIdParamsSchema, body: adminVenueStatusBodySchema }),
  updateAdminVenueStatus
);
router.patch(
  "/venues/:venueId/featured",
  adminWriteLimiter,
  validateRequest({ params: adminVenueIdParamsSchema, body: adminVenueFeaturedBodySchema }),
  updateAdminVenueFeatured
);

router.get("/bookings", adminReadLimiter, validateRequest({ query: adminBookingListQuerySchema }), getAdminBookings);
router.patch(
  "/venues/:venueId/bookings/:bookingId/status",
  adminWriteLimiter,
  validateRequest({ params: adminBookingParamsSchema, body: adminBookingStatusBodySchema }),
  updateAdminBookingStatus
);

router.get(
  "/notifications/recipients",
  adminReadLimiter,
  validateRequest({ query: adminNotificationRecipientsQuerySchema }),
  getAdminNotificationRecipients
);
router.get(
  "/notifications",
  adminReadLimiter,
  validateRequest({ query: adminNotificationListQuerySchema }),
  getAdminNotifications
);
router.post(
  "/notifications",
  adminWriteLimiter,
  (req, res, next) => {
    if (req.body?.scheduledAt === "") {
      delete req.body.scheduledAt;
    }
    if (req.body?.metadata?.actionUrl === "") {
      delete req.body.metadata.actionUrl;
    }
    next();
  },
  validateRequest({ body: adminNotificationCreateBodySchema }),
  createAdminNotification
);
router.post(
  "/notifications/:notificationId/send",
  notificationSendLimiter,
  validateRequest({ params: adminNotificationIdParamsSchema }),
  sendAdminNotification
);

router.get(
  "/audit-logs",
  adminReadLimiter,
  validateRequest({ query: adminAuditLogsQuerySchema }),
  getAdminAuditLogs
);

export default router;
