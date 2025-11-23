import User from "../models/userModel.js";
import Event from '../models/eventModel.js';
import asyncHandler from 'express-async-handler';
import sendEmail from '../config/sendEmail.js';
import { AdminSentEmailHtml } from '../utils/emailTemplate.js';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
dotenv.config();

export const exportAnalyticsPDF = asyncHandler(async (req, res) => {
    try {
        // Fetch analytics data
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        const usersByRole = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        const totalEvents = await Event.countDocuments();
        const activeEvents = await Event.countDocuments({
            date: { $gte: new Date() }
        });
        const pastEvents = await Event.countDocuments({
            date: { $lt: new Date() }
        });
        const eventsByCategory = await Event.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const usersThisMonth = await User.countDocuments({
            createdAt: { $gte: new Date(new Date().setDate(1)) }
        });
        const eventsThisMonth = await Event.countDocuments({
            createdAt: { $gte: new Date(new Date().setDate(1)) }
        });

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        const popularEvents = await Event.find()
            .sort({ participants: -1 })
            .limit(5)
            .populate('createdBy', 'name')
            .select('name category participants createdBy');

        // Create PDF document
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="sportsbuddy-analytics-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Pipe PDF to response
        doc.pipe(res);

        // Colors
        const primaryColor = '#1e40af';
        const textColor = '#374151';

        // Header
        doc.fillColor(primaryColor)
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('SportsBuddy Analytics Report', 50, 50);

        doc.fillColor(textColor)
            .fontSize(12)
            .font('Helvetica')
            .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

        // Add line separator
        doc.moveTo(50, 110)
            .lineTo(545, 110)
            .stroke();

        let yPosition = 130;

        // User Statistics Section
        doc.fillColor(primaryColor)
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('User Statistics', 50, yPosition);

        yPosition += 30;

        doc.fillColor(textColor)
            .fontSize(12)
            .font('Helvetica')
            .text(`Total Users: ${totalUsers}`, 70, yPosition)
            .text(`New Users Today: ${newUsersToday}`, 70, yPosition + 20)
            .text(`Users This Month: ${usersThisMonth}`, 70, yPosition + 40);

        yPosition += 80;

        // Users by Role
        if (usersByRole.length > 0) {
            doc.fillColor(textColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Users by Role:', 70, yPosition);

            yPosition += 25;

            usersByRole.forEach((role, index) => {
                doc.fillColor(textColor)
                    .fontSize(11)
                    .font('Helvetica')
                    .text(`• ${role._id || 'Unknown'}: ${role.count} users (${((role.count / totalUsers) * 100).toFixed(1)}%)`, 90, yPosition);
                yPosition += 18;
            });
        }

        yPosition += 30;

        // Event Statistics Section
        doc.fillColor(primaryColor)
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('Event Statistics', 50, yPosition);

        yPosition += 30;

        doc.fillColor(textColor)
            .fontSize(12)
            .font('Helvetica')
            .text(`Total Events: ${totalEvents}`, 70, yPosition)
            .text(`Active Events: ${activeEvents}`, 70, yPosition + 20)
            .text(`Past Events: ${pastEvents}`, 70, yPosition + 40)
            .text(`Events This Month: ${eventsThisMonth}`, 70, yPosition + 60);

        yPosition += 100;

        // Events by Category
        if (eventsByCategory.length > 0) {
            doc.fillColor(textColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Events by Category:', 70, yPosition);

            yPosition += 25;

            eventsByCategory.forEach((category, index) => {
                doc.fillColor(textColor)
                    .fontSize(11)
                    .font('Helvetica')
                    .text(`• ${category._id || 'Other'}: ${category.count} events`, 90, yPosition);
                yPosition += 18;
            });
        }

        // Check if we need a new page
        if (yPosition > 650) {
            doc.addPage();
            yPosition = 50;
        } else {
            yPosition += 30;
        }

        // Recent Users Section
        if (recentUsers.length > 0) {
            doc.fillColor(primaryColor)
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('Recent Users', 50, yPosition);

            yPosition += 30;

            // Table header
            doc.fillColor(primaryColor)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Name', 70, yPosition)
                .text('Email', 200, yPosition)
                .text('Role', 350, yPosition)
                .text('Joined', 450, yPosition);

            yPosition += 20;

            // Table rows
            recentUsers.forEach((user, index) => {
                doc.fillColor(textColor)
                    .fontSize(10)
                    .font('Helvetica')
                    .text(user.name, 70, yPosition)
                    .text(user.email, 200, yPosition)
                    .text(user.role, 350, yPosition)
                    .text(new Date(user.createdAt).toLocaleDateString(), 450, yPosition);
                yPosition += 18;
            });
        }

        yPosition += 30;

        // Popular Events Section
        if (popularEvents.length > 0 && yPosition < 650) {
            doc.fillColor(primaryColor)
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('Popular Events', 50, yPosition);

            yPosition += 30;

            // Table header
            doc.fillColor(primaryColor)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Event Name', 70, yPosition)
                .text('Category', 250, yPosition)
                .text('Participants', 350, yPosition)
                .text('Organizer', 450, yPosition);

            yPosition += 20;

            // Table rows
            popularEvents.forEach((event, index) => {
                doc.fillColor(textColor)
                    .fontSize(10)
                    .font('Helvetica')
                    .text(event.name, 70, yPosition)
                    .text(event.category || 'General', 250, yPosition)
                    .text((event.participants?.length || 0).toString(), 350, yPosition)
                    .text(event.createdBy?.name || 'Unknown', 450, yPosition);
                yPosition += 18;
            });
        }

        // Key Insights Section
        yPosition += 40;

        if (yPosition > 650) {
            doc.addPage();
            yPosition = 50;
        }

        doc.fillColor(primaryColor)
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('Key Insights', 50, yPosition);

        yPosition += 30;

        const insights = [
            `User Growth Rate: ${totalUsers > 0 ? ((newUsersToday / totalUsers) * 100).toFixed(2) : 0}% daily`,
            `Event Completion Rate: ${totalEvents > 0 ? ((pastEvents / totalEvents) * 100).toFixed(1) : 0}%`,
            `Most Popular Category: ${eventsByCategory[0]?._id || 'N/A'}`,
            `Average Events per User: ${totalUsers > 0 ? (totalEvents / totalUsers).toFixed(2) : 0}`,
            `Active to Total Event Ratio: ${totalEvents > 0 ? ((activeEvents / totalEvents) * 100).toFixed(1) : 0}%`
        ];

        insights.forEach((insight, index) => {
            doc.fillColor(textColor)
                .fontSize(12)
                .font('Helvetica')
                .text(`• ${insight}`, 70, yPosition);
            yPosition += 20;
        });

        // Footer
        const pageHeight = doc.page.height;
        doc.fillColor('#6b7280')
            .fontSize(10)
            .font('Helvetica')
            .text('SportsBuddy Analytics Report - Confidential', 50, pageHeight - 50)
            .text(`Page 1 of 1`, 450, pageHeight - 50);

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export analytics as PDF',
            error: error.message
        });
    }
});

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const usersByRole = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Event statistics
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({
        date: { $gte: new Date() }
    });
    const pastEvents = await Event.countDocuments({
        date: { $lt: new Date() }
    });
    const eventsByCategory = await Event.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const popularEvents = await Event.find()
        .sort({ participants: -1 })
        .limit(5)
        .populate('createdBy', 'name email');

    // Recent data
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password');
    const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name');

    // Time-based analytics
    const usersThisMonth = await User.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setDate(1)) // First day of current month
        }
    });
    const eventsThisMonth = await Event.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setDate(1)) // First day of current month
        }
    });

    // Community statistics
    const Community = (await import('../models/communityModel.js')).default;
    const totalCommunities = await Community.countDocuments();
    const activeCommunities = await Community.countDocuments({ isActive: true });
    const privateCommunities = await Community.countDocuments({ isPrivate: true });
    
    const communityStats = await Community.aggregate([
        {
            $project: {
                memberCount: {
                    $size: {
                        $filter: {
                            input: '$members',
                            cond: { $eq: ['$$this.isActive', true] }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalMembers: { $sum: '$memberCount' }
            }
        }
    ]);

    const totalMembers = communityStats.length > 0 ? communityStats[0].totalMembers : 0;

    res.json({
        users: {
            total: totalUsers,
            newToday: newUsersToday,
            byRole: usersByRole,
            thisMonth: usersThisMonth,
            recent: recentUsers
        },
        events: {
            total: totalEvents,
            active: activeEvents,
            past: pastEvents,
            byCategory: eventsByCategory,
            popular: popularEvents,
            thisMonth: eventsThisMonth,
            recent: recentEvents
        },
        communities: {
            totalCommunities,
            activeCommunities,
            privateCommunities,
            totalMembers
        }
    });
});

export const manageUsers = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = {};

        // Add search filter for name and email
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            searchQuery.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        // Add role filter
        if (role && role !== 'all') {
            searchQuery.role = role;
        }

        // Build sort object
        let sortObject = {};
        if (sortBy) {
            sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortObject.createdAt = -1; // Default sort
        }

        // Get total count for pagination
        const totalUsers = await User.countDocuments(searchQuery);

        // Fetch users with pagination, search, and sorting
        const users = await User.find(searchQuery)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .sort(sortObject)
            .skip(skip)
            .limit(limitNum)
            .lean(); // Use lean() for better performance

        // Add computed fields
        const enhancedUsers = users.map(user => ({
            ...user,
            // Add computed fields that might be useful
            isActive: user.isActive !== false, // Default to true if not set
            eventsCreated: 0, // This would need to be calculated from Event collection
            lastActive: user.lastActive || user.updatedAt || user.createdAt
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(totalUsers / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Get role statistics
        const roleStats = await User.aggregate([
            { $match: searchQuery },
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Response with pagination and metadata
        res.json({
            success: true,
            data: enhancedUsers,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalUsers,
                hasNextPage,
                hasPrevPage,
                limit: limitNum
            },
            filters: {
                search,
                role,
                sortBy,
                sortOrder
            },
            statistics: {
                totalUsers,
                roleDistribution: roleStats
            }
        });

    } catch (error) {
        console.error('Error in manageUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Enhanced getUserById with more details
export const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpire')
            .lean();

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Get user's events count
        const eventsCreated = await Event.countDocuments({ createdBy: user._id });
        const eventsParticipated = await Event.countDocuments({
            participants: user._id
        });

        // Enhanced user object
        const enhancedUser = {
            ...user,
            eventsCreated,
            eventsParticipated,
            isActive: user.isActive !== false,
            accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)), // days
        };

        res.json({
            success: true,
            data: enhancedUser
        });

    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

// Enhanced updateUser with validation
export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already registered');
            }
        }

        // Update fields if provided
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        // Update the updatedAt field
        user.updatedAt = new Date();

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                updatedAt: updatedUser.updatedAt
            }
        });

    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update user',
            error: error.message
        });
    }
});

// Enhanced deleteUser with cascade delete
export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                res.status(400);
                throw new Error('Cannot delete the last admin user');
            }
        }

        // Optional: Handle user's events (you might want to transfer ownership or delete them)
        // For now, we'll just remove the user from events they're participating in
        await Event.updateMany(
            { participants: user._id },
            { $pull: { participants: user._id } }
        );

        // Delete user's created events or transfer them to another admin
        // You can implement this based on your business logic
        await Event.updateMany(
            { createdBy: user._id },
            {
                $set: {
                    createdBy: null, // or assign to another admin
                    status: 'archived' // or whatever status you want
                }
            }
        );

        await user.deleteOne();

        // Invalidate admin cache
        await deleteCachePattern(CacheKeys.ADMIN.ALL());
        await deleteCachePattern(CacheKeys.USERS.ALL(req.params.id));

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete user',
            error: error.message
        });
    }
});

// Enhanced manageEvents with pagination, filtering, and sorting
export const manageEvents = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = {};

        // Add search filter for name, description, and organizer
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            searchQuery.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        // Add category filter
        if (category && category !== 'all') {
            searchQuery.category = category;
        }

        // Add status filter
        if (status && status !== 'all') {
            searchQuery.status = status;
        }

        // Build sort object
        let sortObject = {};
        if (sortBy) {
            if (sortBy === 'participants') {
                // Sort by participants array length
                sortObject = { 'participantCount': sortOrder === 'desc' ? -1 : 1 };
            } else {
                sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
            }
        } else {
            sortObject.createdAt = -1; // Default sort
        }

        // Get total count for pagination
        const totalEvents = await Event.countDocuments(searchQuery);

        // Build aggregation pipeline for enhanced data
        const pipeline = [
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                    pipeline: [
                        { $project: { name: 1, email: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    participantCount: { $size: { $ifNull: ['$participants', []] } },
                    isUpcoming: { $gte: ['$date', new Date()] },
                    isPast: { $lt: ['$date', new Date()] },
                    daysUntilEvent: {
                        $divide: [
                            { $subtract: ['$date', new Date()] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            }
        ];

        // Add sorting
        if (sortBy === 'participants') {
            pipeline.push({ $sort: { participantCount: sortOrder === 'desc' ? -1 : 1 } });
        } else {
            pipeline.push({ $sort: sortObject });
        }

        // Add pagination
        pipeline.push(
            { $skip: skip },
            { $limit: limitNum }
        );

        // Execute aggregation
        const events = await Event.aggregate(pipeline);

        // Calculate pagination info
        const totalPages = Math.ceil(totalEvents / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Get category statistics
        const categoryStats = await Event.aggregate([
            { $match: searchQuery },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get status statistics
        const statusStats = await Event.aggregate([
            { $match: searchQuery },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Response with pagination and metadata
        res.json({
            success: true,
            data: events,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalEvents,
                hasNextPage,
                hasPrevPage,
                limit: limitNum
            },
            filters: {
                search,
                category,
                status,
                sortBy,
                sortOrder
            },
            statistics: {
                totalEvents,
                categoryDistribution: categoryStats,
                statusDistribution: statusStats
            }
        });

    } catch (error) {
        console.error('Error in manageEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
});

// Get single event details
export const getEventById = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email avatar')
            .populate('participants', 'name email avatar')
            .lean();

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Add computed fields
        const enhancedEvent = {
            ...event,
            participantCount: event.participants?.length || 0,
            isUpcoming: new Date(event.date) >= new Date(),
            isPast: new Date(event.date) < new Date(),
            spotsRemaining: event.maxParticipants ? event.maxParticipants - (event.participants?.length || 0) : null,
            daysUntilEvent: Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24))
        };

        res.json({
            success: true,
            data: enhancedEvent
        });

    } catch (error) {
        console.error('Error in getEventById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
});

// Enhanced updateEvent with validation
export const updateEvent = asyncHandler(async (req, res) => {
    try {
        const { name, description, category, status, maxParticipants, date, location } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Validate max participants if being updated
        if (maxParticipants !== undefined) {
            const currentParticipants = event.participants?.length || 0;
            if (maxParticipants < currentParticipants) {
                res.status(400);
                throw new Error(`Cannot set max participants below current participant count (${currentParticipants})`);
            }
        }

        // Update fields if provided
        if (name !== undefined) event.name = name;
        if (description !== undefined) event.description = description;
        if (category !== undefined) event.category = category;
        if (status !== undefined) event.status = status;
        if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
        if (date !== undefined) event.date = new Date(date);
        if (location !== undefined) event.location = location;

        // Update the updatedAt field
        event.updatedAt = new Date();

        const updatedEvent = await event.save();

        // Populate the response
        await updatedEvent.populate('createdBy', 'name email');

        // Invalidate caches
        await deleteCachePattern(CacheKeys.ADMIN.ALL());
        await deleteCachePattern(CacheKeys.EVENTS.ALL_EVENTS());

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });

    } catch (error) {
        console.error('Error in updateEvent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update event',
            error: error.message
        });
    }
});

// Enhanced deleteEvent with cascade operations
export const deleteEvent = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('participants', 'email name')
            .populate('createdBy', 'email name');

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Send notification to participants before deletion (optional)
        if (event.participants && event.participants.length > 0) {
            const participantEmails = event.participants.map(p => p.email);
            
            try {
                await sendEmail({
                    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                    to: participantEmails,
                    subject: `Event Cancelled: ${event.name}`,
                    message: `We regret to inform you that the event "${event.name}" has been cancelled by the administrator.`,
                    html: AdminSentEmailHtml({
                        subject: `Event Cancelled: ${event.name}`,
                        message: `We regret to inform you that the event "${event.name}" has been cancelled by the administrator.`
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send cancellation emails:', emailError);
                // Continue with deletion even if email fails
            }
        }

        await event.deleteOne();

        // Invalidate caches
        await deleteCachePattern(CacheKeys.ADMIN.ALL());
        await deleteCachePattern(CacheKeys.EVENTS.ALL_EVENTS());

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteEvent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete event',
            error: error.message
        });
    }
});

// Approve event
export const approveEvent = asyncHandler(async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'email name');

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        event.status = 'Upcoming';
        event.approvedAt = new Date();
        await event.save();

        // Send approval email to organizer
        if (event.createdBy?.email) {
            try {
                await sendEmail({
                    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                    to: event.createdBy.email,
                    subject: `Event Approved: ${event.name}`,
                    message: `Great news! Your event "${event.name}" has been approved and is now live on SportsBuddy.`,
                    html: AdminSentEmailHtml({
                        subject: `Event Approved: ${event.name}`,
                        message: `Great news! Your event "${event.name}" has been approved and is now live on SportsBuddy.`
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Event approved successfully',
            data: event
        });

    } catch (error) {
        console.error('Error in approveEvent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to approve event',
            error: error.message
        });
    }
});

// Reject event
export const rejectEvent = asyncHandler(async (req, res) => {
    try {
        const { reason } = req.body;
        const event = await Event.findById(req.params.id).populate('createdBy', 'email name');

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        event.status = 'Rejected';
        event.rejectedAt = new Date();
        event.rejectionReason = reason || 'No reason provided';
        await event.save();

        // Send rejection email to organizer
        if (event.createdBy?.email) {
            try {
                await sendEmail({
                    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                    to: event.createdBy.email,
                    subject: `Event Rejected: ${event.name}`,
                    message: `We regret to inform you that your event "${event.name}" has been rejected. Reason: ${reason || 'No specific reason provided'}`,
                    html: AdminSentEmailHtml({
                        subject: `Event Rejected: ${event.name}`,
                        message: `We regret to inform you that your event "${event.name}" has been rejected. Reason: ${reason || 'No specific reason provided'}`
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Event rejected successfully',
            data: event
        });

    } catch (error) {
        console.error('Error in rejectEvent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject event',
            error: error.message
        });
    }
});

// Export events data
export const exportEvents = asyncHandler(async (req, res) => {
    try {
        const { format = 'csv' } = req.query;

        const events = await Event.find({})
            .populate('createdBy', 'name email')
            .populate('participants', 'name email')
            .lean();

        if (format === 'csv') {
            // Create CSV content
            const headers = [
                'Event ID',
                'Name',
                'Description',
                'Category',
                'Status',
                'Date',
                'Location (City)',
                'Location (State)',
                'Max Participants',
                'Current Participants',
                'Organizer Name',
                'Organizer Email',
                'Created At',
                'Updated At'
            ];

            const csvRows = events.map(event => [
                event._id.toString(),
                `"${event.name || ''}"`,
                `"${(event.description || '').replace(/"/g, '""')}"`,
                `"${event.category || ''}"`,
                `"${event.status || ''}"`,
                `"${event.date ? new Date(event.date).toISOString() : ''}"`,
                `"${event.location?.city || ''}"`,
                `"${event.location?.state || ''}"`,
                event.maxParticipants || '',
                event.participants?.length || 0,
                `"${event.createdBy?.name || ''}"`,
                `"${event.createdBy?.email || ''}"`,
                `"${new Date(event.createdAt).toISOString()}"`,
                `"${new Date(event.updatedAt).toISOString()}"`
            ]);

            const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="sportsbuddy-events-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);

        } else if (format === 'json') {
            // Enhanced JSON export with computed fields
            const enhancedEvents = events.map(event => ({
                ...event,
                participantCount: event.participants?.length || 0,
                spotsRemaining: event.maxParticipants ? event.maxParticipants - (event.participants?.length || 0) : null,
                isUpcoming: new Date(event.date) >= new Date(),
                isPast: new Date(event.date) < new Date(),
                participantEmails: event.participants?.map(p => p.email) || []
            }));

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="sportsbuddy-events-${new Date().toISOString().split('T')[0]}.json"`);
            res.json({
                exportedAt: new Date().toISOString(),
                totalEvents: events.length,
                events: enhancedEvents
            });

        } else {
            res.status(400);
            throw new Error('Invalid export format. Use "csv" or "json"');
        }

    } catch (error) {
        console.error('Error exporting events:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to export events',
            error: error.message
        });
    }
});

// Get event statistics
export const getEventStats = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        // Basic counts
        const totalEvents = await Event.countDocuments();
        const activeEvents = await Event.countDocuments({ date: { $gte: now } });
        const pastEvents = await Event.countDocuments({ date: { $lt: now } });
        const eventsThisMonth = await Event.countDocuments({ createdAt: { $gte: startOfMonth } });
        const eventsToday = await Event.countDocuments({ createdAt: { $gte: startOfToday } });

        // Status distribution
        const statusStats = await Event.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Category distribution
        const categoryStats = await Event.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Monthly growth (last 6 months)
        const monthlyGrowth = await Event.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Participation stats
        const participationStats = await Event.aggregate([
            {
                $addFields: {
                    participantCount: { $size: { $ifNull: ["$participants", []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalParticipants: { $sum: "$participantCount" },
                    avgParticipantsPerEvent: { $avg: "$participantCount" },
                    maxParticipants: { $max: "$participantCount" },
                    eventsWithParticipants: {
                        $sum: { $cond: [{ $gt: ["$participantCount", 0] }, 1, 0] }
                    }
                }
            }
        ]);

        // Top events by participants
        const topEvents = await Event.aggregate([
            {
                $addFields: {
                    participantCount: { $size: { $ifNull: ["$participants", []] } }
                }
            },
            { $sort: { participantCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    category: 1,
                    participantCount: 1,
                    'createdBy.name': 1,
                    date: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    total: totalEvents,
                    active: activeEvents,
                    past: pastEvents,
                    thisMonth: eventsThisMonth,
                    today: eventsToday,
                    completionRate: totalEvents > 0 ? ((pastEvents / totalEvents) * 100).toFixed(1) : 0
                },
                distribution: {
                    byStatus: statusStats,
                    byCategory: categoryStats
                },
                participation: participationStats[0] || {
                    totalParticipants: 0,
                    avgParticipantsPerEvent: 0,
                    maxParticipants: 0,
                    eventsWithParticipants: 0
                },
                trends: {
                    monthlyGrowth
                },
                topEvents
            }
        });

    } catch (error) {
        console.error('Error getting event stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event statistics',
            error: error.message
        });
    }
});

// Bulk event operations
export const bulkEventActions = asyncHandler(async (req, res) => {
    try {
        const { action, eventIds, data } = req.body;

        if (!action || !eventIds || !Array.isArray(eventIds)) {
            res.status(400);
            throw new Error('Action and eventIds array are required');
        }

        let result;

        switch (action) {
            case 'delete':
                // Get events with participants for notification
                const eventsToDelete = await Event.find({ _id: { $in: eventIds } })
                    .populate('participants', 'email name');

                // Send notifications to all participants
                for (const event of eventsToDelete) {
                    if (event.participants && event.participants.length > 0) {
                        const participantEmails = event.participants.map(p => p.email);
                        try {
                            await sendEmail({
                                from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
                                to: participantEmails,
                                subject: `Event Cancelled: ${event.name}`,
                                message: `The event "${event.name}" has been cancelled by the administrator.`,
                                html: AdminSentEmailHtml({
                                    subject: `Event Cancelled: ${event.name}`,
                                    message: `The event "${event.name}" has been cancelled by the administrator.`
                                }),
                            });
                        } catch (emailError) {
                            console.error(`Failed to send cancellation email for event ${event._id}:`, emailError);
                        }
                    }
                }

                result = await Event.deleteMany({ _id: { $in: eventIds } });
                break;

            case 'updateStatus':
                if (!data.status) {
                    res.status(400);
                    throw new Error('Status is required for bulk status update');
                }
                result = await Event.updateMany(
                    { _id: { $in: eventIds } },
                    { status: data.status, updatedAt: new Date() }
                );
                break;

            case 'approve':
                result = await Event.updateMany(
                    { _id: { $in: eventIds } },
                    { status: 'Upcoming', approvedAt: new Date(), updatedAt: new Date() }
                );
                break;

            case 'reject':
                result = await Event.updateMany(
                    { _id: { $in: eventIds } },
                    { 
                        status: 'Rejected', 
                        rejectedAt: new Date(), 
                        rejectionReason: data.reason || 'Bulk rejection',
                        updatedAt: new Date() 
                    }
                );
                break;

            default:
                res.status(400);
                throw new Error('Invalid action');
        }

        res.json({
            success: true,
            message: `Bulk ${action} completed successfully`,
            affectedCount: result.modifiedCount || result.deletedCount
        });

    } catch (error) {
        console.error('Error in bulk event actions:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to perform bulk action',
            error: error.message
        });
    }
});

export const adminSearch = asyncHandler(async (req, res) => {
    try {
        const { 
            type, 
            query, 
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            filters = {}
        } = req.query;

        // Validate required parameters
        if (!type || !query || query.trim().length === 0) {
            res.status(400);
            throw new Error("Search type and query are required");
        }

        if (!['users', 'events', 'notifications', 'all'].includes(type)) {
            res.status(400);
            throw new Error("Invalid search type. Use 'users', 'events', 'notifications', or 'all'");
        }

        // Convert page and limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Parse filters if provided as string
        let parsedFilters = {};
        if (typeof filters === 'string') {
            try {
                parsedFilters = JSON.parse(filters);
            } catch (error) {
                parsedFilters = {};
            }
        } else {
            parsedFilters = filters;
        }

        // Clean up filters - convert empty strings and "all" to undefined
        Object.keys(parsedFilters).forEach(key => {
            if (parsedFilters[key] === '' || parsedFilters[key] === 'all') {
                delete parsedFilters[key];
            }
        });

        // Create case-insensitive search regex with word boundary support
        const searchTerm = query.trim();
        const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

        let results = {};

        if (type === 'users' || type === 'all') {
            // Advanced user search with better query structure
            const userQuery = {
                $or: [
                    { name: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } },
                    { username: { $regex: searchRegex } }
                ]
            };

            // Apply user-specific filters
            if (parsedFilters.role) {
                userQuery.role = parsedFilters.role;
            }
            if (parsedFilters.isActive !== undefined) {
                userQuery.isActive = parsedFilters.isActive === 'true' || parsedFilters.isActive === true;
            }
            if (parsedFilters.dateFrom) {
                userQuery.createdAt = { 
                    ...userQuery.createdAt, 
                    $gte: new Date(parsedFilters.dateFrom) 
                };
            }
            if (parsedFilters.dateTo) {
                userQuery.createdAt = { 
                    ...userQuery.createdAt, 
                    $lte: new Date(parsedFilters.dateTo) 
                };
            }

            console.log('User search query:', JSON.stringify(userQuery, null, 2));

            // Get total count for users
            const totalUsers = await User.countDocuments(userQuery);

            // Enhanced user aggregation pipeline
            const userPipeline = [
                { $match: userQuery },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'createdBy',
                        as: 'createdEvents'
                    }
                },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'participants',
                        as: 'participatedEvents'
                    }
                },
                {
                    $addFields: {
                        eventsCreated: { $size: { $ifNull: ['$createdEvents', []] } },
                        eventsParticipated: { $size: { $ifNull: ['$participatedEvents', []] } },
                        totalEngagement: { 
                            $add: [
                                { $size: { $ifNull: ['$createdEvents', []] } }, 
                                { $size: { $ifNull: ['$participatedEvents', []] } }
                            ] 
                        },
                        accountAge: {
                            $divide: [
                                { $subtract: [new Date(), '$createdAt'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $project: {
                        password: 0,
                        resetPasswordToken: 0,
                        resetPasswordExpire: 0,
                        createdEvents: 0,
                        participatedEvents: 0
                    }
                },
                { $sort: sortObject },
                { $skip: type === 'all' ? 0 : skip },
                { $limit: type === 'all' ? 5 : limitNum }
            ];

            const users = await User.aggregate(userPipeline);

            results.users = {
                data: users,
                pagination: type !== 'all' ? {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalUsers / limitNum),
                    total: totalUsers,
                    hasNext: pageNum < Math.ceil(totalUsers / limitNum),
                    hasPrev: pageNum > 1
                } : { total: totalUsers, showing: users.length }
            };
        }

        if (type === 'events' || type === 'all') {
            // Advanced event search with better query structure
            const eventQuery = {
                $or: [
                    { name: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { category: { $regex: searchRegex } },
                    { 'location.city': { $regex: searchRegex } },
                    { 'location.state': { $regex: searchRegex } },
                    { 'location.address': { $regex: searchRegex } }
                ]
            };

            // Apply event-specific filters
            if (parsedFilters.category) {
                eventQuery.category = parsedFilters.category;
            }
            if (parsedFilters.status) {
                eventQuery.status = parsedFilters.status;
            }
            if (parsedFilters.difficulty) {
                eventQuery.difficulty = parsedFilters.difficulty;
            }
            if (parsedFilters.dateFrom) {
                eventQuery.date = { 
                    ...eventQuery.date, 
                    $gte: new Date(parsedFilters.dateFrom) 
                };
            }
            if (parsedFilters.dateTo) {
                eventQuery.date = { 
                    ...eventQuery.date, 
                    $lte: new Date(parsedFilters.dateTo) 
                };
            }

            console.log('Event search query:', JSON.stringify(eventQuery, null, 2));

            // Get total count for events
            const totalEvents = await Event.countDocuments(eventQuery);

            // Enhanced event aggregation pipeline
            const eventPipeline = [
                { $match: eventQuery },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'organizer',
                        pipeline: [
                            { $project: { name: 1, email: 1, avatar: 1, role: 1 } }
                        ]
                    }
                },
                {
                    $addFields: {
                        organizer: { $arrayElemAt: ['$organizer', 0] },
                        participantCount: { $size: { $ifNull: ['$participants', []] } },
                        spotsRemaining: {
                            $cond: {
                                if: '$maxParticipants',
                                then: { 
                                    $subtract: [
                                        '$maxParticipants', 
                                        { $size: { $ifNull: ['$participants', []] } }
                                    ] 
                                },
                                else: null
                            }
                        },
                        isUpcoming: { $gte: ['$date', new Date()] },
                        isPast: { $lt: ['$date', new Date()] },
                        daysUntilEvent: {
                            $divide: [
                                { $subtract: ['$date', new Date()] },
                                1000 * 60 * 60 * 24
                            ]
                        },
                        avgRating: { $avg: { $ifNull: ['$ratings.rating', []] } },
                        totalRatings: { $size: { $ifNull: ['$ratings', []] } },
                        searchRelevance: {
                            $sum: [
                                { $cond: [{ $regexMatch: { input: { $ifNull: ['$name', ''] }, regex: searchRegex } }, 10, 0] },
                                { $cond: [{ $regexMatch: { input: { $ifNull: ['$description', ''] }, regex: searchRegex } }, 5, 0] },
                                { $cond: [{ $regexMatch: { input: { $ifNull: ['$category', ''] }, regex: searchRegex } }, 3, 0] }
                            ]
                        }
                    }
                },
                { 
                    $sort: parsedFilters.relevanceSort ? 
                        { searchRelevance: -1, ...sortObject } : 
                        sortObject 
                },
                { $skip: type === 'all' ? 0 : skip },
                { $limit: type === 'all' ? 5 : limitNum }
            ];

            const events = await Event.aggregate(eventPipeline);

            results.events = {
                data: events,
                pagination: type !== 'all' ? {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalEvents / limitNum),
                    total: totalEvents,
                    hasNext: pageNum < Math.ceil(totalEvents / limitNum),
                    hasPrev: pageNum > 1
                } : { total: totalEvents, showing: events.length }
            };
        }

        if (type === 'notifications' || type === 'all') {
            try {
                // Try to import notification model
                const { default: Notification } = await import('../models/notificationModel.js');
                
                const notificationQuery = {
                    $or: [
                        { title: { $regex: searchRegex } },
                        { message: { $regex: searchRegex } },
                        { type: { $regex: searchRegex } }
                    ]
                };

                // Apply notification-specific filters
                if (parsedFilters.notificationType) {
                    notificationQuery.type = parsedFilters.notificationType;
                }
                if (parsedFilters.priority) {
                    notificationQuery.priority = parsedFilters.priority;
                }
                if (parsedFilters.status) {
                    notificationQuery.status = parsedFilters.status;
                }
                if (parsedFilters.dateFrom) {
                    notificationQuery.createdAt = { 
                        ...notificationQuery.createdAt, 
                        $gte: new Date(parsedFilters.dateFrom) 
                    };
                }
                if (parsedFilters.dateTo) {
                    notificationQuery.createdAt = { 
                        ...notificationQuery.createdAt, 
                        $lte: new Date(parsedFilters.dateTo) 
                    };
                }

                console.log('Notification search query:', JSON.stringify(notificationQuery, null, 2));

                // Get total count for notifications
                const totalNotifications = await Notification.countDocuments(notificationQuery);

                // Enhanced notification aggregation pipeline
                const notificationPipeline = [
                    { $match: notificationQuery },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'createdBy',
                            foreignField: '_id',
                            as: 'creator',
                            pipeline: [
                                { $project: { name: 1, email: 1, role: 1 } }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            creator: { $arrayElemAt: ['$creator', 0] },
                            deliveryRate: {
                                $cond: {
                                    if: { $gt: [{ $ifNull: ['$recipientCount', 0] }, 0] },
                                    then: { 
                                        $multiply: [
                                            { $divide: [{ $ifNull: ['$deliveredCount', 0] }, { $ifNull: ['$recipientCount', 1] }] },
                                            100
                                        ]
                                    },
                                    else: 0
                                }
                            },
                            openRate: {
                                $cond: {
                                    if: { $gt: [{ $ifNull: ['$deliveredCount', 0] }, 0] },
                                    then: { 
                                        $multiply: [
                                            { $divide: [{ $ifNull: ['$readCount', 0] }, { $ifNull: ['$deliveredCount', 1] }] },
                                            100
                                        ]
                                    },
                                    else: 0
                                }
                            },
                            daysAgo: {
                                $divide: [
                                    { $subtract: [new Date(), '$createdAt'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    },
                    { $sort: sortObject },
                    { $skip: type === 'all' ? 0 : skip },
                    { $limit: type === 'all' ? 5 : limitNum }
                ];

                const notifications = await Notification.aggregate(notificationPipeline);

                results.notifications = {
                    data: notifications,
                    pagination: type !== 'all' ? {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalNotifications / limitNum),
                        total: totalNotifications,
                        hasNext: pageNum < Math.ceil(totalNotifications / limitNum),
                        hasPrev: pageNum > 1
                    } : { total: totalNotifications, showing: notifications.length }
                };
            } catch (notificationError) {
                console.log('Notification model not available:', notificationError.message);
                // Skip notifications if model doesn't exist
                results.notifications = {
                    data: [],
                    pagination: { total: 0, showing: 0 }
                };
            }
        }

        // Generate search insights for 'all' type
        if (type === 'all') {
            const insights = {
                totalResults: Object.values(results).reduce((sum, category) => 
                    sum + (category.pagination?.total || 0), 0
                ),
                categoryBreakdown: Object.entries(results).map(([key, value]) => ({
                    category: key,
                    count: value.pagination?.total || 0,
                    showing: value.data?.length || 0
                })),
                searchTerm: query,
                appliedFilters: Object.keys(parsedFilters).length,
                searchTime: new Date().toISOString()
            };

            results.insights = insights;
        }

        // Add search suggestions for low results
        if (type !== 'all') {
            const categoryResult = results[type];
            if (categoryResult && categoryResult.pagination.total < 3) {
                const suggestions = await generateSearchSuggestions(type, query);
                categoryResult.suggestions = suggestions;
            }
        }

        console.log('Search results summary:', {
            searchTerm: query,
            type,
            totalResults: type === 'all' ? results.insights?.totalResults : results[type]?.pagination?.total,
            appliedFilters: parsedFilters
        });

        res.json({
            success: true,
            searchQuery: query,
            searchType: type,
            appliedFilters: parsedFilters,
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in advanced admin search:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message,
            debug: {
                query: req.query,
                searchTerm: req.query.query
            }
        });
    }
});

// Updated search suggestions function
export const generateSearchSuggestions = async (type, query) => {
    try {
        const suggestions = [];
        const searchRegex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        if (type === 'users') {
            // Get popular user search terms
            const popularUsers = await User.aggregate([
                {
                    $addFields: {
                        eventsCreated: { $size: { $ifNull: ['$createdEvents', []] } }
                    }
                },
                { $sort: { eventsCreated: -1 } },
                { $limit: 5 },
                { $project: { name: 1, role: 1, eventsCreated: 1 } }
            ]);
            
            suggestions.push(
                ...popularUsers.map(user => ({
                    type: 'user',
                    suggestion: user.name,
                    reason: 'Popular organizer'
                }))
            );
            
            // Add role-based suggestions
            suggestions.push(
                { type: 'filter', suggestion: 'admin', reason: 'Search admin users' },
                { type: 'filter', suggestion: 'user', reason: 'Search regular users' }
            );
            
        } else if (type === 'events') {
            // Get popular categories
            const popularCategories = await Event.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            
            suggestions.push(
                ...popularCategories.map(cat => ({
                    type: 'category',
                    suggestion: cat._id,
                    reason: `${cat.count} events in this category`
                }))
            );
            
            // Add time-based suggestions
            suggestions.push(
                { type: 'filter', suggestion: 'upcoming events', reason: 'Search upcoming events' },
                { type: 'filter', suggestion: 'football', reason: 'Popular sport category' }
            );
            
        } else if (type === 'notifications') {
            // Add generic notification suggestions
            suggestions.push(
                { type: 'filter', suggestion: 'announcement', reason: 'Announcement notifications' },
                { type: 'filter', suggestion: 'system', reason: 'System notifications' },
                { type: 'filter', suggestion: 'event', reason: 'Event notifications' }
            );
        }
        
        return suggestions.slice(0, 5);
        
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return [];
    }
};

// Get all venue bookings for admin
export const getAllVenueBookings = asyncHandler(async (req, res) => {
    try {
        const { status } = req.query;
        const Venue = (await import('../models/venueModel.js')).default;

        // Get all venues with their bookings
        const venues = await Venue.find({})
            .populate('bookings.user', 'name email phone avatar')
            .populate('bookings.event', 'name date')
            .lean();

        // Extract all bookings from all venues
        let allBookings = [];
        venues.forEach(venue => {
            if (venue.bookings && venue.bookings.length > 0) {
                venue.bookings.forEach(booking => {
                    allBookings.push({
                        ...booking,
                        venue: {
                            _id: venue._id,
                            name: venue.name,
                            location: venue.location
                        }
                    });
                });
            }
        });

        // Filter by status if provided
        if (status && status !== 'all') {
            allBookings = allBookings.filter(booking => booking.status === status);
        }

        // Sort by most recent bookings first
        allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: allBookings,
            count: allBookings.length
        });
    } catch (error) {
        console.error('Get all venue bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch venue bookings'
        });
    }
});

// Manage Communities - Admin
export const manageCommunities = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            privacy = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = {};

        // Add search filter
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            searchQuery.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ];
        }

        // Add category filter
        if (category && category !== 'all') {
            searchQuery.category = category;
        }

        // Add privacy filter
        if (privacy && privacy !== 'all') {
            searchQuery.isPrivate = privacy === 'private';
        }

        // Build sort object
        let sortObject = {};
        if (sortBy === 'members') {
            sortObject = { 'memberCount': sortOrder === 'desc' ? -1 : 1 };
        } else {
            sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Get total count
        const Community = (await import('../models/communityModel.js')).default;
        const totalCommunities = await Community.countDocuments(searchQuery);

        // Build aggregation pipeline
        const pipeline = [
            { $match: searchQuery },
            {
                $addFields: {
                    memberCount: {
                        $size: {
                            $filter: {
                                input: '$members',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator',
                    pipeline: [
                        { $project: { name: 1, email: 1, avatar: 1, username: 1 } }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$creator',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: sortObject },
            { $skip: skip },
            { $limit: limitNum },
            {
                $project: {
                    joinRequests: 0,
                    'members.user': 0,
                    posts: 0
                }
            }
        ];

        const communities = await Community.aggregate(pipeline);

        res.json({
            success: true,
            data: communities,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCommunities / limitNum),
                totalCommunities,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Manage communities error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch communities'
        });
    }
});

// Get Community by ID - Admin
export const getCommunityById = asyncHandler(async (req, res) => {
    try {
        const Community = (await import('../models/communityModel.js')).default;
        const community = await Community.findById(req.params.id)
            .populate('creator', 'name email avatar username')
            .populate('admins', 'name email avatar username')
            .populate('moderators', 'name email avatar username')
            .select('-joinRequests -posts');

        if (!community) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            data: community
        });
    } catch (error) {
        console.error('Get community by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch community'
        });
    }
});

// Update Community - Admin
export const updateCommunityAdmin = asyncHandler(async (req, res) => {
    try {
        const Community = (await import('../models/communityModel.js')).default;
        const community = await Community.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('creator', 'name email avatar username');

        if (!community) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            message: 'Community updated successfully',
            data: community
        });
    } catch (error) {
        console.error('Update community error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update community'
        });
    }
});

// Delete Community - Admin
export const deleteCommunityAdmin = asyncHandler(async (req, res) => {
    try {
        const Community = (await import('../models/communityModel.js')).default;
        const community = await Community.findById(req.params.id);

        if (!community) {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            });
        }

        // Delete community image from Cloudinary if exists
        if (community.image?.public_id) {
            const cloudinary = (await import('../config/cloudinary.js')).default;
            try {
                await cloudinary.uploader.destroy(community.image.public_id);
            } catch (error) {
                console.error('Error deleting community image:', error);
            }
        }

        await community.deleteOne();

        res.json({
            success: true,
            message: 'Community deleted successfully'
        });
    } catch (error) {
        console.error('Delete community error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete community'
        });
    }
});