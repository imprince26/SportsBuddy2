import express from 'express';
import { cacheMiddleware, noCacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';
const router = express.Router();
import {
    getDashboardAnalytics,
    exportAnalyticsPDF,
    manageUsers,
    getUserById,
    updateUser,
    deleteUser,
    manageEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    exportEvents,
    getEventStats,
    adminSearch,
} from '../controllers/adminController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const adminTTL = getCacheTTL('admin');

router.use(isAuthenticated, isAdmin);

// Dashboard & Analytics with caching
router.route('/analytics').get(
  cacheMiddleware(() => CacheKeys.ADMIN.ANALYTICS(), adminTTL),
  getDashboardAnalytics
);

// Export PDF should not be cached
router.route('/analytics/export').get(noCacheMiddleware(), exportAnalyticsPDF);

// User Management with caching
router.route('/users').get(
  cacheMiddleware((req) => CacheKeys.ADMIN.USERS_LIST(req.query.page || 1, req.query), adminTTL),
  manageUsers
);

router.route('/users/:id').get(
  cacheMiddleware((req) => CacheKeys.ADMIN.USER_DETAIL(req.params.id), adminTTL),
  getUserById
).put(updateUser).delete(deleteUser);

// Event Management with caching
router.route('/events').get(
  cacheMiddleware((req) => CacheKeys.ADMIN.EVENTS_LIST(req.query.page || 1, req.query), adminTTL),
  manageEvents
);

router.route('/events/stats').get(
  cacheMiddleware(() => CacheKeys.ADMIN.EVENT_STATS(), adminTTL * 2),
  getEventStats
);

// Export events should not be cached
router.route('/events/export').get(noCacheMiddleware(), exportEvents);

router.route('/events/:id').get(
  cacheMiddleware((req) => CacheKeys.ADMIN.EVENT_DETAIL(req.params.id), adminTTL),
  getEventById
).put(updateEvent).delete(deleteEvent);

router.route('/events/:id/approve').put(approveEvent);
router.route('/events/:id/reject').put(rejectEvent);

// Search with caching
router.route('/search').get(
  cacheMiddleware((req) => `admin:search:${req.query.query}:${req.query.type}`, adminTTL / 2),
  adminSearch
);

export default router;