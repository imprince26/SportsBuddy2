import express from "express";
import {
  getAdminDashboardOverview,
  getAdminGrowthAnalytics,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserRole,
  updateAdminUserStatus,
  getAdminEvents,
  updateAdminEventStatus,
  deleteAdminEvent,
  getAdminCommunities,
  updateAdminCommunityStatus,
  deleteAdminCommunity,
  getAdminVenues,
  updateAdminVenueVerification,
  updateAdminVenueStatus,
  getAdminBookings,
  updateAdminBookingStatus,
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
  adminEventStatusBodySchema,
  adminCommunityListQuerySchema,
  adminCommunityIdParamsSchema,
  adminCommunityStatusBodySchema,
  adminVenueListQuerySchema,
  adminVenueIdParamsSchema,
  adminVenueVerificationBodySchema,
  adminVenueStatusBodySchema,
  adminBookingListQuerySchema,
  adminBookingParamsSchema,
  adminBookingStatusBodySchema,
  adminNotificationListQuerySchema,
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
router.patch(
  "/events/:eventId/status",
  adminWriteLimiter,
  validateRequest({ params: adminEventIdParamsSchema, body: adminEventStatusBodySchema }),
  updateAdminEventStatus
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

router.get("/bookings", adminReadLimiter, validateRequest({ query: adminBookingListQuerySchema }), getAdminBookings);
router.patch(
  "/venues/:venueId/bookings/:bookingId/status",
  adminWriteLimiter,
  validateRequest({ params: adminBookingParamsSchema, body: adminBookingStatusBodySchema }),
  updateAdminBookingStatus
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
