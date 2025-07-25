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
        }
    });
});//     try {
//         // Fetch all analytics data
//         const totalUsers = await User.countDocuments();
//         const newUsersToday = await User.countDocuments({
//             createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
//         });
//         const usersByRole = await User.aggregate([
//             { $group: { _id: "$role", count: { $sum: 1 } } }
//         ]);

//         const totalEvents = await Event.countDocuments();
//         const activeEvents = await Event.countDocuments({ 
//             date: { $gte: new Date() } 
//         });
//         const pastEvents = await Event.countDocuments({ 
//             date: { $lt: new Date() } 
//         });
//         const eventsByCategory = await Event.aggregate([
//             { $group: { _id: "$category", count: { $sum: 1 } } }
//         ]);

//         const usersThisMonth = await User.countDocuments({
//             createdAt: { 
//                 $gte: new Date(new Date().setDate(1))
//             }
//         });
//         const eventsThisMonth = await Event.countDocuments({
//             createdAt: { 
//                 $gte: new Date(new Date().setDate(1))
//             }
//         });

//         // Get user growth data for the last 6 months
//         const monthlyUserGrowth = await User.aggregate([
//             {
//                 $match: {
//                     createdAt: {
//                         $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         year: { $year: "$createdAt" },
//                         month: { $month: "$createdAt" }
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { "_id.year": 1, "_id.month": 1 } }
//         ]);

//         // Get event growth data for the last 6 months
//         const monthlyEventGrowth = await Event.aggregate([
//             {
//                 $match: {
//                     createdAt: {
//                         $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         year: { $year: "$createdAt" },
//                         month: { $month: "$createdAt" }
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { "_id.year": 1, "_id.month": 1 } }
//         ]);

//         // Get top events by participants
//         const topEvents = await Event.find()
//             .sort({ participants: -1 })
//             .limit(10)
//             .populate('createdBy', 'name email')
//             .select('name category date location participants createdBy');

//         // Get recent activity
//         const recentUsers = await User.find()
//             .sort({ createdAt: -1 })
//             .limit(10)
//             .select('name email role createdAt');

//         const recentEvents = await Event.find()
//             .sort({ createdAt: -1 })
//             .limit(10)
//             .populate('createdBy', 'name')
//             .select('name category date location createdBy createdAt');

//         // Create comprehensive analytics report
//         const analyticsReport = {
//             generatedAt: new Date().toISOString(),
//             reportPeriod: `Generated on ${new Date().toLocaleDateString()}`,
//             summary: {
//                 users: {
//                     total: totalUsers,
//                     newToday: newUsersToday,
//                     thisMonth: usersThisMonth,
//                     byRole: usersByRole,
//                     growthRate: newUsersToday > 0 ? ((newUsersToday / totalUsers) * 100).toFixed(2) + '%' : '0%'
//                 },
//                 events: {
//                     total: totalEvents,
//                     active: activeEvents,
//                     past: pastEvents,
//                     thisMonth: eventsThisMonth,
//                     byCategory: eventsByCategory,
//                     completionRate: totalEvents > 0 ? ((pastEvents / totalEvents) * 100).toFixed(1) + '%' : '0%'
//                 }
//             },
//             trends: {
//                 userGrowth: monthlyUserGrowth,
//                 eventGrowth: monthlyEventGrowth
//             },
//             topPerformers: {
//                 events: topEvents
//             },
//             recentActivity: {
//                 users: recentUsers,
//                 events: recentEvents
//             },
//             insights: {
//                 mostActiveCategory: eventsByCategory.length > 0 ? eventsByCategory[0]._id : 'N/A',
//                 averageEventsPerUser: totalUsers > 0 ? (totalEvents / totalUsers).toFixed(2) : '0',
//                 userEngagement: {
//                     dailyActive: Math.floor(totalUsers * 0.15),
//                     weeklyActive: Math.floor(totalUsers * 0.45),
//                     monthlyActive: Math.floor(totalUsers * 0.70)
//                 }
//             }
//         };

//         // Set headers for file download
//         res.setHeader('Content-Type', 'application/json');
//         res.setHeader('Content-Disposition', `attachment; filename="sportsbuddy-analytics-${new Date().toISOString().split('T')[0]}.json"`);
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Pragma', 'no-cache');
//         res.setHeader('Expires', '0');

//         // Send the analytics report
//         res.status(200).json(analyticsReport);

//     } catch (error) {
//         console.error('Analytics export error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to export analytics',
//             error: error.message
//         });
//     }
// });

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

// Add a new endpoint for bulk user operations
// export const bulkUserActions = asyncHandler(async (req, res) => {
//     try {
//         const { action, userIds, data } = req.body;

//         if (!action || !userIds || !Array.isArray(userIds)) {
//             res.status(400);
//             throw new Error('Action and userIds array are required');
//         }

//         let result;

//         switch (action) {
//             case 'delete':
//                 // Prevent deleting all admins
//                 const adminCount = await User.countDocuments({
//                     role: 'admin',
//                     _id: { $nin: userIds }
//                 });

//                 if (adminCount === 0) {
//                     res.status(400);
//                     throw new Error('Cannot delete all admin users');
//                 }

//                 result = await User.deleteMany({ _id: { $in: userIds } });
//                 break;

//             case 'updateRole':
//                 if (!data.role) {
//                     res.status(400);
//                     throw new Error('Role is required for bulk role update');
//                 }
//                 result = await User.updateMany(
//                     { _id: { $in: userIds } },
//                     { role: data.role, updatedAt: new Date() }
//                 );
//                 break;

//             case 'activate':
//                 result = await User.updateMany(
//                     { _id: { $in: userIds } },
//                     { isActive: true, updatedAt: new Date() }
//                 );
//                 break;

//             case 'deactivate':
//                 result = await User.updateMany(
//                     { _id: { $in: userIds } },
//                     { isActive: false, updatedAt: new Date() }
//                 );
//                 break;

//             default:
//                 res.status(400);
//                 throw new Error('Invalid action');
//         }

//         res.json({
//             success: true,
//             message: `Bulk ${action} completed successfully`,
//             affectedCount: result.modifiedCount || result.deletedCount
//         });

//     } catch (error) {
//         console.error('Error in bulk user actions:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to perform bulk action',
//             error: error.message
//         });
//     }
// });

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
});//     const { subject, message } = req.body;
//     const user = await User.findById(req.params.id);

//     if (!user) {
//         res.status(404);
//         throw new Error('User not found');
//     }

//     try {
//         await sendEmail({
//             from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//             to: user.email,
//             subject,
//             message,
//             html: AdminSentEmailHtml({ subject, message }),
//         });
//         res.status(200).json({ success: true, message: 'Notification sent successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: error.message || 'Email could not be sent' });
//     }
// });

// export const sendNotificationToAll = asyncHandler(async (req, res) => {
//     const { subject, message } = req.body;
//     const users = await User.find({}, 'email');
//     const emails = users.map(user => user.email);

//     try {
//         await sendEmail({
//             from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//             to: emails,
//             subject,
//             message,
//             html: AdminSentEmailHtml({ subject, message }),
//         });
//         res.status(200).json({ success: true, message: 'Notifications sent successfully to all users' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Email could not be sent' });
//     }
// });

export const adminSearch = asyncHandler(async (req, res) => {
    const { type, query } = req.query;
    let results = [];

    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    if (type === 'users') {
        results = await User.find({
            $or: [{ name: searchRegex }, { email: searchRegex }],
        }).select('-password');
    } else if (type === 'events') {
        results = await Event.find({
            $or: [{ name: searchRegex }, { description: searchRegex }, { category: searchRegex }],
        }).populate('createdBy', 'name email');
    } else {
        res.status(400);
        throw new Error("Invalid search type. Use 'users' or 'events'.");
    }

    res.json(results);
});