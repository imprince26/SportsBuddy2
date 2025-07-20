import express from 'express';
const router = express.Router();
import {
    getDashboardAnalytics,
    exportAnalyticsPDF,
    manageUsers,
    getUserById,
    updateUser,
    deleteUser,
    bulkUserActions, // Add this new import
    manageEvents,
    deleteEvent,
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
router.route('/users/bulk').post(bulkUserActions); // Add this new route
router.route('/users/:id').get(getUserById).put(updateUser).delete(deleteUser);

// Event Management
router.route('/events').get(manageEvents);
router.route('/events/:id').delete(deleteEvent);

// Notifications
router.route('/notifications/all').post(sendNotificationToAll);
router.route('/notifications/user/:id').post(sendNotificationToUser);

// Search
router.route('/search').get(adminSearch);

export default router;