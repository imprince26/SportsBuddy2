import express from 'express';
const router = express.Router();
import {
    getDashboardAnalytics,
    exportAnalyticsPDF,
    manageUsers,
    getUserById,
    updateUser,
    deleteUser,
    bulkUserActions,
    manageEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    sendEventNotification,
    exportEvents,
    getEventStats,
    bulkEventActions,
    sendNotificationToUser,
    sendNotificationToAll,
    adminSearch,
} from '../controllers/adminController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

router.use(isAuthenticated, isAdmin);

// Dashboard & Analytics
router.route('/analytics').get(getDashboardAnalytics);
router.route('/analytics/export').get(exportAnalyticsPDF);

// User Management
router.route('/users').get(manageUsers);
router.route('/users/bulk').post(bulkUserActions);
router.route('/users/:id').get(getUserById).put(updateUser).delete(deleteUser);

// Event Management
router.route('/events').get(manageEvents);
router.route('/events/stats').get(getEventStats);
router.route('/events/export').get(exportEvents);
router.route('/events/bulk').post(bulkEventActions);
router.route('/events/:id').get(getEventById).put(updateEvent).delete(deleteEvent);
router.route('/events/:id/approve').put(approveEvent);
router.route('/events/:id/reject').put(rejectEvent);
router.route('/events/:id/notify').post(sendEventNotification);

// Notifications
router.route('/notifications/all').post(sendNotificationToAll);
router.route('/notifications/user/:id').post(sendNotificationToUser);

// Search
router.route('/search').get(adminSearch);

export default router;