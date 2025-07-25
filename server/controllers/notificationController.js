import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import Event from '../models/eventModel.js';
import sendEmail from '../config/sendEmail.js';
import { AdminSentEmailHtml } from '../utils/emailTemplate.js';

// @desc    Create bulk notification
// @route   POST /api/notifications/bulk
// @access  Admin
export const createBulkNotification = asyncHandler(async (req, res) => {
    const { title, message, type, priority, recipients, specificRecipients, scheduledAt, metadata } = req.body;

    // Validation
    if (!title || !message) {
        res.status(400);
        throw new Error('Title and message are required');
    }

    const notification = await Notification.create({
        title,
        message,
        type: type || 'announcement',
        priority: priority || 'normal',
        recipients: recipients || 'all',
        specificRecipients: specificRecipients || [],
        createdBy: req.user._id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        metadata: metadata || {}
    });

    // If not scheduled, send immediately
    if (!scheduledAt) {
        await sendBulkNotificationNow(notification);
    }

    res.status(201).json({
        success: true,
        message: scheduledAt ? 'Notification scheduled successfully' : 'Notification sent successfully',
        data: notification
    });
});

// @desc    Send bulk notification immediately
// @route   POST /api/notifications/bulk/:id/send
// @access  Admin
export const sendBulkNotificationNow = asyncHandler(async (notificationId, res = null) => {
    let notification;
    
    if (typeof notificationId === 'string') {
        notification = await Notification.findById(notificationId);
    } else {
        notification = notificationId; // Already a notification object
    }

    if (!notification) {
        if (res) {
            res.status(404);
            throw new Error('Notification not found');
        }
        throw new Error('Notification not found');
    }

    try {
        // Get target users
        let users = [];
        if (notification.recipients === 'all') {
            users = await User.find({});
        } else if (notification.recipients === 'users') {
            users = await User.find({ role: 'user' });
        } else if (notification.recipients === 'admins') {
            users = await User.find({ role: 'admin' });
        } else if (notification.recipients === 'specific') {
            const userIds = notification.specificRecipients.map(r => r.user);
            users = await User.find({ _id: { $in: userIds } });
        }

        // Add in-app notifications to users
        for (const user of users) {
            await user.addBulkNotification(notification);
            
            // Log delivery
            notification.deliveryLogs.push({
                recipient: user._id,
                email: user.email,
                deliveryStatus: 'delivered',
                deliveredAt: new Date()
            });
        }

        // Send emails if enabled
        if (notification.metadata.emailSent !== false && users.length > 0) {
            const emails = users.map(user => user.email);
            
            try {
                await sendEmail({
                    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                    to: emails,
                    subject: notification.title,
                    message: notification.message,
                    html: AdminSentEmailHtml({ 
                        subject: notification.title, 
                        message: notification.message 
                    })
                });
                
                notification.metadata.emailSent = true;
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                notification.metadata.emailSent = false;
            }
        }

        // Update notification status
        await notification.markAsSent();
        await notification.updateStatistics();

        if (res) {
            res.status(200).json({
                success: true,
                message: `Notification sent to ${users.length} users`,
                data: notification
            });
        }

        return notification;

    } catch (error) {
        await notification.markAsFailed(error.message);
        if (res) {
            res.status(500);
            throw new Error(`Failed to send notification: ${error.message}`);
        }
        throw error;
    }
});

// @desc    Get all bulk notifications
// @route   GET /api/notifications/bulk
// @access  Admin
export const getBulkNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, type, priority } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
        success: true,
        data: notifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get bulk notification by ID
// @route   GET /api/notifications/bulk/:id
// @access  Admin
export const getBulkNotificationById = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('deliveryLogs.recipient', 'name email');

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    res.json({
        success: true,
        data: notification
    });
});

// @desc    Update bulk notification
// @route   PUT /api/notifications/bulk/:id
// @access  Admin
export const updateBulkNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    // Only allow updates if not sent
    if (notification.status === 'sent') {
        res.status(400);
        throw new Error('Cannot update sent notification');
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Notification updated successfully',
        data: updatedNotification
    });
});

// @desc    Delete bulk notification
// @route   DELETE /api/notifications/bulk/:id
// @access  Admin
export const deleteBulkNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Notification deleted successfully'
    });
});

// @desc    Get user's personal notifications
// @route   GET /api/notifications/user
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const user = await User.findById(req.user._id).select('notifications');
    
    let notifications = user.notifications;
    
    if (unreadOnly === 'true') {
        notifications = notifications.filter(notif => !notif.read);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: paginatedNotifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: notifications.length,
            unreadCount: user.getUnreadNotificationCount()
        }
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/user/:notificationId/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    await user.markNotificationAsRead(req.params.notificationId);

    res.json({
        success: true,
        message: 'Notification marked as read'
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/user/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    await user.markAllNotificationsAsRead();

    res.json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// @desc    Delete user notification
// @route   DELETE /api/notifications/user/:notificationId
// @access  Private
export const deleteUserNotification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.notifications.id(req.params.notificationId).remove();
    await user.save();

    res.json({
        success: true,
        message: 'Notification deleted successfully'
    });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Admin
export const getNotificationStats = asyncHandler(async (req, res) => {
    const stats = await Notification.aggregate([
        {
            $group: {
                _id: null,
                totalNotifications: { $sum: 1 },
                totalSent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                totalDraft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                totalScheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
                totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                totalRecipients: { $sum: '$recipientCount' },
                totalDelivered: { $sum: '$deliveredCount' },
                totalRead: { $sum: '$readCount' },
                avgEngagementRate: { $avg: '$engagementRate' }
            }
        }
    ]);

    const typeStats = await Notification.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgEngagement: { $avg: '$engagementRate' }
            }
        }
    ]);

    const monthlyStats = await Notification.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                recipients: { $sum: '$recipientCount' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);

    res.json({
        success: true,
        data: {
            overview: stats[0] || {},
            byType: typeStats,
            monthly: monthlyStats
        }
    });
});

// @desc    Send notification to event participants
// @route   POST /api/notifications/event/:eventId
// @access  Private (Event Creator or Admin)
export const sendEventNotification = asyncHandler(async (req, res) => {
    const { title, message, priority = 'normal' } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('participants.user', 'email name');
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is event creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to send notifications for this event');
    }

    // Use the event model method
    await event.notifyParticipants({ title, message, priority });

    res.json({
        success: true,
        message: `Notification sent to ${event.participants.length} participants`
    });
});

// @desc    Send personal notification to user
// @route   POST /api/notifications/user/:userId
// @access  Admin
export const sendPersonalNotification = asyncHandler(async (req, res) => {
    const { title, message, type = 'system', priority = 'normal', actionUrl } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const notification = {
        type,
        title,
        message,
        priority,
        actionUrl,
        timestamp: new Date()
    };

    await user.addNotification(notification);

    res.json({
        success: true,
        message: 'Personal notification sent successfully'
    });
});

// @desc    Archive bulk notification
// @route   PUT /api/notifications/bulk/:id/archive
// @access  Admin
export const archiveBulkNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { 
            archived: true, 
            archivedAt: new Date() 
        },
        { new: true }
    );

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    res.json({
        success: true,
        message: 'Notification archived successfully',
        data: notification
    });
});

// @desc    Get notification templates
// @route   GET /api/notifications/templates
// @access  Admin
export const getNotificationTemplates = asyncHandler(async (req, res) => {
    const templates = [
        {
            id: 'welcome',
            name: 'Welcome Message',
            title: 'Welcome to SportsBuddy!',
            message: 'Welcome to SportsBuddy! We\'re excited to have you join our community of sports enthusiasts.',
            type: 'system'
        },
        {
            id: 'event_reminder',
            name: 'Event Reminder',
            title: 'Event Reminder: {{eventName}}',
            message: 'Don\'t forget about the upcoming event "{{eventName}}" scheduled for {{eventDate}}.',
            type: 'event'
        },
        {
            id: 'maintenance',
            name: 'Maintenance Notice',
            title: 'Scheduled Maintenance',
            message: 'SportsBuddy will undergo scheduled maintenance from {{startTime}} to {{endTime}}. We apologize for any inconvenience.',
            type: 'system'
        },
        {
            id: 'feature_announcement',
            name: 'New Feature',
            title: 'New Feature: {{featureName}}',
            message: 'Check out our latest feature: {{featureName}}! {{featureDescription}}',
            type: 'announcement'
        }
    ];

    res.json({
        success: true,
        data: templates
    });
});