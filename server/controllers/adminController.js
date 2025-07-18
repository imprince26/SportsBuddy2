import User from "../models/userModel.js";
import Event from '../models/eventModel.js';
import asyncHandler from 'express-async-handler';
import sendEmail from '../config/sendEmail.js';
import { AdminSentEmailHtml } from '../utils/emailTemplate.js';
import dotenv from 'dotenv';
dotenv.config();


export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);

    res.json({
        totalUsers,
        totalEvents,
        recentUsers,
        recentEvents,
    });
});

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
    const events = await Event.find({}).populate('organizer', 'name email');
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
            $or: [{ name: searchRegex }, { description: searchRegex }, { sport: searchRegex }],
        }).populate('organizer', 'name email');
    } else {
        res.status(400);
        throw new Error("Invalid search type. Use 'users' or 'events'.");
    }

    res.json(results);
});