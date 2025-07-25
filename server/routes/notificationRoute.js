import express from 'express';
import {
    createBulkNotification,
    sendBulkNotificationNow,
    getBulkNotifications,
    getBulkNotificationById,
    updateBulkNotification,
    deleteBulkNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteUserNotification,
    getNotificationStats,
    sendEventNotification,
    sendPersonalNotification,
    archiveBulkNotification,
    getNotificationTemplates
} from '../controllers/notificationController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bulk notification routes (isAdmin only)
router.route('/bulk')
    .post(isAuthenticated, isAdmin, createBulkNotification)
    .get(isAuthenticated, isAdmin, getBulkNotifications);

router.route('/bulk/:id')
    .get(isAuthenticated, isAdmin, getBulkNotificationById)
    .put(isAuthenticated, isAdmin, updateBulkNotification)
    .delete(isAuthenticated, isAdmin, deleteBulkNotification);

router.route('/bulk/:id/send')
    .post(isAuthenticated, isAdmin, (req, res) => sendBulkNotificationNow(req.params.id, res));

router.route('/bulk/:id/archive')
    .put(isAuthenticated, isAdmin, archiveBulkNotification);

// User notification routes
router.route('/user')
    .get(isAuthenticated, getUserNotifications);

router.route('/user/read-all')
    .put(isAuthenticated, markAllNotificationsAsRead);

router.route('/user/:notificationId')
    .delete(isAuthenticated, deleteUserNotification);

router.route('/user/:notificationId/read')
    .put(isAuthenticated, markNotificationAsRead);

// Personal notification to specific user (Admin only)
router.route('/user/:userId/send')
    .post(isAuthenticated, isAdmin, sendPersonalNotification);

// Event notification routes
router.route('/event/:eventId')
    .post(isAuthenticated, sendEventNotification);

// Statistics and templates (Admin only)
router.route('/stats')
    .get(isAuthenticated, isAdmin, getNotificationStats);

router.route('/templates')
    .get(isAuthenticated, isAdmin, getNotificationTemplates);

export default router;