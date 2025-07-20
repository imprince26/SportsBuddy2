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
});

// export const exportAnalytics = asyncHandler(async (req, res) => {
//     try {
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
    const users = await User.find({}).select('-password');
    res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        // Add any other fields you want to be updatable by admin
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const manageEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({}).populate('createdBy', 'name email');
    res.json(events);
});

export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event) {
        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

export const sendNotificationToUser = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    try {
        await sendEmail({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: user.email,
            subject,
            message,
            html: AdminSentEmailHtml({ subject, message }),
        });
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Email could not be sent' });
    }
});

export const sendNotificationToAll = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const users = await User.find({}, 'email');
    const emails = users.map(user => user.email);

    try {
        await sendEmail({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: emails,
            subject,
            message,
            html: AdminSentEmailHtml({ subject, message }),
        });
        res.status(200).json({ success: true, message: 'Notifications sent successfully to all users' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
});

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