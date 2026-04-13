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

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/dashboard/overview", adminReadLimiter, getAdminDashboardOverview);
router.get("/dashboard/growth", adminReadLimiter, getAdminGrowthAnalytics);
router.get("/search", adminReadLimiter, adminGlobalSearch);
router.get("/system/health", adminReadLimiter, getAdminSystemHealth);

router.get("/users", adminReadLimiter, getAdminUsers);
router.get("/users/:userId", adminReadLimiter, getAdminUserDetails);
router.patch("/users/:userId/role", adminWriteLimiter, updateAdminUserRole);
router.patch("/users/:userId/status", adminWriteLimiter, updateAdminUserStatus);

router.get("/events", adminReadLimiter, getAdminEvents);
router.patch("/events/:eventId/status", adminWriteLimiter, updateAdminEventStatus);
router.delete("/events/:eventId", adminWriteLimiter, deleteAdminEvent);

router.get("/communities", adminReadLimiter, getAdminCommunities);
router.patch("/communities/:communityId/status", adminWriteLimiter, updateAdminCommunityStatus);
router.delete("/communities/:communityId", adminWriteLimiter, deleteAdminCommunity);

router.get("/venues", adminReadLimiter, getAdminVenues);
router.patch("/venues/:venueId/verification", adminWriteLimiter, updateAdminVenueVerification);
router.patch("/venues/:venueId/status", adminWriteLimiter, updateAdminVenueStatus);

router.get("/bookings", adminReadLimiter, getAdminBookings);
router.patch(
  "/venues/:venueId/bookings/:bookingId/status",
  adminWriteLimiter,
  updateAdminBookingStatus
);

router.get("/notifications", adminReadLimiter, getAdminNotifications);
router.post("/notifications", adminWriteLimiter, createAdminNotification);
router.post("/notifications/:notificationId/send", notificationSendLimiter, sendAdminNotification);

router.get("/audit-logs", adminReadLimiter, getAdminAuditLogs);

export default router;
