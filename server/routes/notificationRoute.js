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
import {
    adminReadLimiter,
    adminWriteLimiter,
    notificationSendLimiter,
    userWriteLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.route('/bulk')
    .post(isAuthenticated, isAdmin, notificationSendLimiter, createBulkNotification)
    .get(isAuthenticated, isAdmin, adminReadLimiter, getBulkNotifications);

router.route('/bulk/:id')
    .get(isAuthenticated, isAdmin, adminReadLimiter, getBulkNotificationById)
    .put(isAuthenticated, isAdmin, adminWriteLimiter, updateBulkNotification)
    .delete(isAuthenticated, isAdmin, adminWriteLimiter, deleteBulkNotification);

router.route('/bulk/:id/send')
    .post(isAuthenticated, isAdmin, notificationSendLimiter, (req, res) => sendBulkNotificationNow(req.params.id, res));

router.route('/bulk/:id/archive')
    .put(isAuthenticated, isAdmin, adminWriteLimiter, archiveBulkNotification);

router.route('/user')
    .get(isAuthenticated, getUserNotifications);

router.route('/user/read-all')
    .put(isAuthenticated, userWriteLimiter, markAllNotificationsAsRead);

router.route('/user/:notificationId')
    .delete(isAuthenticated, userWriteLimiter, deleteUserNotification);

router.route('/user/:notificationId/read')
    .put(isAuthenticated, userWriteLimiter, markNotificationAsRead);

router.route('/user/:userId/send')
    .post(isAuthenticated, isAdmin, notificationSendLimiter, sendPersonalNotification);

router.route('/event/:eventId')
    .post(isAuthenticated, userWriteLimiter, sendEventNotification);

router.route('/stats')
    .get(isAuthenticated, isAdmin, adminReadLimiter, getNotificationStats);

router.route('/templates')
    .get(isAuthenticated, isAdmin, adminReadLimiter, getNotificationTemplates);

export default router;
