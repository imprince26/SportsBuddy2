import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Community from "../models/communityModel.js";
import Venue from "../models/venueModel.js";
import Notification from "../models/notificationModel.js";
import AdminAuditLog from "../models/adminAuditLogModel.js";
import { logAdminAction } from "../utils/adminAudit.js";
import {
  dispatchAdminNotification,
  normalizeSpecificRecipients,
} from "../services/adminNotificationService.js";

const ALLOWED_EVENT_STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const ALLOWED_USER_ROLES = ["user", "admin"];
const ALLOWED_ACCOUNT_STATUSES = ["active", "suspended", "banned"];
const ALLOWED_NOTIFICATION_TYPES = ["announcement", "system", "event", "marketing", "urgent"];
const ALLOWED_NOTIFICATION_PRIORITIES = ["low", "normal", "high"];
const ALLOWED_NOTIFICATION_RECIPIENTS = ["all", "users", "admins", "specific"];
const ALLOWED_BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];

const parsePagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const rawLimit = Number.parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const parseSort = (sortBy, allowedMap, fallback) => {
  if (!sortBy || typeof sortBy !== "string") {
    return fallback;
  }

  const [field, direction] = sortBy.split(":");
  const mappedField = allowedMap[field];
  if (!mappedField) {
    return fallback;
  }

  return { [mappedField]: direction === "asc" ? 1 : -1 };
};

const parseBooleanQuery = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const buildDateRangeMatch = (from, to, fieldName) => {
  const match = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      match.$gte = fromDate;
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      match.$lte = toDate;
    }
  }
  return Object.keys(match).length ? { [fieldName]: match } : {};
};

const fillDailySeries = (series, startDate) => {
  const map = new Map(series.map((item) => [item.date, item.count]));
  const result = [];
  const current = new Date(startDate);
  const end = new Date();

  while (current <= end) {
    const dateKey = current.toISOString().slice(0, 10);
    result.push({ date: dateKey, count: map.get(dateKey) || 0 });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
};

export const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    totalAdmins,
    usersLast30Days,
    totalEvents,
    activeEvents,
    totalCommunities,
    activeCommunities,
    totalVenues,
    verifiedVenues,
    bookingsSummary,
    notificationsSummary,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: "active" }),
    User.countDocuments({ accountStatus: "suspended" }),
    User.countDocuments({ accountStatus: "banned" }),
    User.countDocuments({ role: "admin", accountStatus: "active" }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Event.countDocuments(),
    Event.countDocuments({ status: { $in: ["Upcoming", "Ongoing"] } }),
    Community.countDocuments(),
    Community.countDocuments({ isActive: true }),
    Venue.countDocuments(),
    Venue.countDocuments({ isVerified: true }),
    Venue.aggregate([
      { $unwind: { path: "$bookings", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: {
              $cond: [{ $eq: ["$bookings.status", "confirmed"] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$bookings.status", "confirmed"] },
                { $ifNull: ["$bookings.totalAmount", { $ifNull: ["$bookings.amount", 0] }] },
                0,
              ],
            },
          },
        },
      },
    ]),
    Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          scheduled: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        admins: totalAdmins,
        newLast30Days: usersLast30Days,
      },
      events: {
        total: totalEvents,
        active: activeEvents,
      },
      communities: {
        total: totalCommunities,
        active: activeCommunities,
      },
      venues: {
        total: totalVenues,
        verified: verifiedVenues,
      },
      bookings: bookingsSummary[0] || {
        totalBookings: 0,
        confirmedBookings: 0,
        totalRevenue: 0,
      },
      notifications: notificationsSummary[0] || {
        total: 0,
        sent: 0,
        scheduled: 0,
        failed: 0,
      },
    },
  });
});

export const getAdminGrowthAnalytics = asyncHandler(async (req, res) => {
  const rangeInDays = Math.max(7, Math.min(180, Number.parseInt(req.query.days, 10) || 30));
  const startDate = new Date(Date.now() - rangeInDays * 24 * 60 * 60 * 1000);

  const [userSeries, eventSeries, bookingSeries] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ]),
    Event.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ]),
    Venue.aggregate([
      { $unwind: { path: "$bookings", preserveNullAndEmptyArrays: false } },
      { $match: { "bookings.bookingDate": { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookings.bookingDate" },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$bookings.status", "confirmed"] },
                { $ifNull: ["$bookings.totalAmount", { $ifNull: ["$bookings.amount", 0] }] },
                0,
              ],
            },
          },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, revenue: 1 } },
      { $sort: { date: 1 } },
    ]),
  ]);

  const filledUsers = fillDailySeries(userSeries, startDate);
  const filledEvents = fillDailySeries(eventSeries, startDate);
  const bookingMap = new Map(bookingSeries.map((item) => [item.date, item]));

  const filledBookings = filledUsers.map((item) => ({
    date: item.date,
    count: bookingMap.get(item.date)?.count || 0,
    revenue: bookingMap.get(item.date)?.revenue || 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      days: rangeInDays,
      users: filledUsers,
      events: filledEvents,
      bookings: filledBookings,
    },
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { search, role, accountStatus } = req.query;
  const sort = parseSort(
    req.query.sortBy,
    {
      createdAt: "createdAt",
      name: "name",
      email: "email",
      lastLoginAt: "lastLoginAt",
    },
    { createdAt: -1 }
  );

  const query = {};

  if (search && search.trim().length >= 2) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { username: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (role && ALLOWED_USER_ROLES.includes(role)) {
    query.role = role;
  }

  if (accountStatus && ALLOWED_ACCOUNT_STATUSES.includes(accountStatus)) {
    query.accountStatus = accountStatus;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("name username email role accountStatus avatar createdAt lastLoginAt stats moderation")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const getAdminUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select("-password -resetPasswordCode -resetPasswordExpire -resetPasswordBlockedUntil")
    .populate("followers", "_id name username avatar")
    .populate("following", "_id name username avatar")
    .lean();

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const [createdEventsCount, participatingEventsCount] = await Promise.all([
    Event.countDocuments({ createdBy: user._id }),
    Event.countDocuments({ "participants.user": user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...user,
      metrics: {
        createdEventsCount,
        participatingEventsCount,
      },
    },
  });
});

export const updateAdminUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!ALLOWED_USER_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user._id.toString() === req.user._id.toString() && role !== "admin") {
    return res.status(400).json({ success: false, message: "You cannot remove your own admin role" });
  }

  if (user.role === "admin" && role !== "admin") {
    const activeAdmins = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (activeAdmins <= 1) {
      return res.status(400).json({
        success: false,
        message: "At least one active admin account is required",
      });
    }
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  await logAdminAction({
    req,
    action: "user.role.update",
    entityType: "user",
    entityId: user._id,
    metadata: {
      previousRole,
      newRole: role,
    },
  });

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: {
      id: user._id,
      role: user.role,
    },
  });
});

export const updateAdminUserStatus = asyncHandler(async (req, res) => {
  const { accountStatus, reason, note } = req.body;

  if (!ALLOWED_ACCOUNT_STATUSES.includes(accountStatus)) {
    return res.status(400).json({ success: false, message: "Invalid account status" });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isSelf = user._id.toString() === req.user._id.toString();
  if (isSelf && accountStatus !== "active") {
    return res.status(400).json({ success: false, message: "You cannot suspend or ban your own account" });
  }

  if (user.role === "admin" && accountStatus !== "active") {
    const activeAdmins = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (activeAdmins <= 1) {
      return res.status(400).json({
        success: false,
        message: "At least one active admin account is required",
      });
    }
  }

  const previousStatus = user.accountStatus;
  user.accountStatus = accountStatus;
  user.moderation = {
    reason: reason || user.moderation?.reason,
    note: note || user.moderation?.note,
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await user.save();

  await logAdminAction({
    req,
    action: "user.status.update",
    entityType: "user",
    entityId: user._id,
    metadata: {
      previousStatus,
      newStatus: accountStatus,
      reason,
    },
  });

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: {
      id: user._id,
      accountStatus: user.accountStatus,
      moderation: user.moderation,
    },
  });
});

export const getAdminEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { search, status, category, createdBy, dateFrom, dateTo } = req.query;

  const sort = parseSort(
    req.query.sortBy,
    {
      createdAt: "createdAt",
      date: "date",
      name: "name",
    },
    { createdAt: -1 }
  );

  const query = {
    ...buildDateRangeMatch(dateFrom, dateTo, "date"),
  };

  if (search && search.trim().length >= 2) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
      { "location.city": { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status && ALLOWED_EVENT_STATUSES.includes(status)) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
    query.createdBy = createdBy;
  }

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate("createdBy", "_id name username email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query),
  ]);

  const mappedEvents = events.map((event) => ({
    ...event,
    participantCount: Array.isArray(event.participants) ? event.participants.length : 0,
    ratingsCount: Array.isArray(event.ratings) ? event.ratings.length : 0,
    averageRating:
      Array.isArray(event.ratings) && event.ratings.length > 0
        ? Number(
            (
              event.ratings.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
              event.ratings.length
            ).toFixed(1)
          )
        : 0,
    waitlistCount: Array.isArray(event.waitlist) ? event.waitlist.length : 0,
  }));

  res.status(200).json({
    success: true,
    data: mappedEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const updateAdminEventStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!ALLOWED_EVENT_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid event status" });
  }

  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const previousStatus = event.status;
  event.status = status;
  event.moderation = {
    ...(event.moderation || {}),
    note: note || event.moderation?.note,
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await event.save();

  await logAdminAction({
    req,
    action: "event.status.update",
    entityType: "event",
    entityId: event._id,
    metadata: {
      previousStatus,
      newStatus: status,
      note,
    },
  });

  res.status(200).json({
    success: true,
    message: "Event status updated successfully",
    data: {
      id: event._id,
      status: event.status,
    },
  });
});

export const updateAdminEventFeatured = asyncHandler(async (req, res) => {
  const { isFeatured } = req.body;

  if (typeof isFeatured !== "boolean") {
    return res.status(400).json({ success: false, message: "isFeatured must be a boolean" });
  }

  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const previousValue = event.isFeatured;
  event.isFeatured = isFeatured;
  event.moderation = {
    ...(event.moderation || {}),
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await event.save();

  await logAdminAction({
    req,
    action: "event.featured.update",
    entityType: "event",
    entityId: event._id,
    metadata: {
      previousValue,
      newValue: isFeatured,
    },
  });

  res.status(200).json({
    success: true,
    message: "Event featured flag updated",
    data: {
      id: event._id,
      isFeatured: event.isFeatured,
    },
  });
});

export const deleteAdminEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  await Promise.all([
    Event.findByIdAndDelete(event._id),
    User.updateMany(
      { $or: [{ createdEvents: event._id }, { participatedEvents: event._id }] },
      {
        $pull: {
          createdEvents: event._id,
          participatedEvents: event._id,
        },
      }
    ),
    Community.updateMany({ events: event._id }, { $pull: { events: event._id } }),
  ]);

  await logAdminAction({
    req,
    action: "event.delete",
    entityType: "event",
    entityId: event._id,
    metadata: {
      name: event.name,
      category: event.category,
    },
  });

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

export const getAdminCommunities = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { search, category, isActive, isPrivate } = req.query;

  const query = {};
  const isActiveParsed = parseBooleanQuery(isActive);
  const isPrivateParsed = parseBooleanQuery(isPrivate);

  if (search && search.trim().length >= 2) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (typeof isActiveParsed === "boolean") {
    query.isActive = isActiveParsed;
  }

  if (typeof isPrivateParsed === "boolean") {
    query.isPrivate = isPrivateParsed;
  }

  const [communities, total] = await Promise.all([
    Community.find(query)
      .populate("creator", "_id name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Community.countDocuments(query),
  ]);

  const mappedCommunities = communities.map((community) => ({
    ...community,
    activeMemberCount: Array.isArray(community.members)
      ? community.members.filter((member) => member.isActive).length
      : 0,
    postCount: Array.isArray(community.posts) ? community.posts.length : 0,
    eventCount: Array.isArray(community.events) ? community.events.length : 0,
    joinRequestCount: Array.isArray(community.joinRequests)
      ? community.joinRequests.filter((request) => request.status === "pending").length
      : 0,
  }));

  res.status(200).json({
    success: true,
    data: mappedCommunities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const updateAdminCommunityStatus = asyncHandler(async (req, res) => {
  const { isActive, note } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive must be a boolean" });
  }

  const community = await Community.findById(req.params.communityId);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community not found" });
  }

  const previousStatus = community.isActive;
  community.isActive = isActive;
  community.moderation = {
    ...(community.moderation || {}),
    note: note || community.moderation?.note,
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await community.save();

  await logAdminAction({
    req,
    action: "community.status.update",
    entityType: "community",
    entityId: community._id,
    metadata: {
      previousStatus,
      newStatus: isActive,
      note,
    },
  });

  res.status(200).json({
    success: true,
    message: "Community status updated successfully",
    data: {
      id: community._id,
      isActive: community.isActive,
    },
  });
});

export const updateAdminCommunityFeatured = asyncHandler(async (req, res) => {
  const { isFeatured } = req.body;

  if (typeof isFeatured !== "boolean") {
    return res.status(400).json({ success: false, message: "isFeatured must be a boolean" });
  }

  const community = await Community.findById(req.params.communityId);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community not found" });
  }

  const previousValue = community.isFeatured;
  community.isFeatured = isFeatured;
  community.moderation = {
    ...(community.moderation || {}),
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await community.save();

  await logAdminAction({
    req,
    action: "community.featured.update",
    entityType: "community",
    entityId: community._id,
    metadata: {
      previousValue,
      newValue: isFeatured,
    },
  });

  res.status(200).json({
    success: true,
    message: "Community featured flag updated",
    data: {
      id: community._id,
      isFeatured: community.isFeatured,
    },
  });
});

export const deleteAdminCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.communityId);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community not found" });
  }

  await Community.findByIdAndDelete(community._id);

  await logAdminAction({
    req,
    action: "community.delete",
    entityType: "community",
    entityId: community._id,
    metadata: {
      name: community.name,
      category: community.category,
    },
  });

  res.status(200).json({ success: true, message: "Community deleted successfully" });
});

export const getAdminVenues = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { search, city, isVerified, isActive, ownerId } = req.query;

  const query = {};
  const isVerifiedParsed = parseBooleanQuery(isVerified);
  const isActiveParsed = parseBooleanQuery(isActive);

  if (search && search.trim().length >= 2) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
      { "location.address": { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (city) {
    query["location.city"] = { $regex: city.trim(), $options: "i" };
  }

  if (typeof isVerifiedParsed === "boolean") {
    query.isVerified = isVerifiedParsed;
  }

  if (typeof isActiveParsed === "boolean") {
    query.isActive = isActiveParsed;
  }

  if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
    query.owner = ownerId;
  }

  const [venues, total] = await Promise.all([
    Venue.find(query)
      .populate("owner", "_id name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Venue.countDocuments(query),
  ]);

  const mappedVenues = venues.map((venue) => {
    const ratings = Array.isArray(venue.ratings) ? venue.ratings : [];
    const bookings = Array.isArray(venue.bookings) ? venue.bookings : [];
    const averageRating =
      ratings.length > 0
        ? Number((ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / ratings.length).toFixed(1))
        : 0;

    return {
      ...venue,
      averageRating,
      ratingsCount: ratings.length,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
    };
  });

  res.status(200).json({
    success: true,
    data: mappedVenues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const updateAdminVenueVerification = asyncHandler(async (req, res) => {
  const { isVerified, note } = req.body;

  if (typeof isVerified !== "boolean") {
    return res.status(400).json({ success: false, message: "isVerified must be a boolean" });
  }

  const venue = await Venue.findById(req.params.venueId);
  if (!venue) {
    return res.status(404).json({ success: false, message: "Venue not found" });
  }

  const previousVerification = venue.isVerified;
  venue.isVerified = isVerified;
  venue.moderation = {
    ...(venue.moderation || {}),
    note: note || venue.moderation?.note,
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await venue.save();

  await logAdminAction({
    req,
    action: "venue.verification.update",
    entityType: "venue",
    entityId: venue._id,
    metadata: {
      previousVerification,
      newVerification: isVerified,
      note,
    },
  });

  res.status(200).json({
    success: true,
    message: "Venue verification updated successfully",
    data: {
      id: venue._id,
      isVerified: venue.isVerified,
    },
  });
});

export const updateAdminVenueStatus = asyncHandler(async (req, res) => {
  const { isActive, note } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive must be a boolean" });
  }

  const venue = await Venue.findById(req.params.venueId);
  if (!venue) {
    return res.status(404).json({ success: false, message: "Venue not found" });
  }

  const previousStatus = venue.isActive;
  venue.isActive = isActive;
  venue.moderation = {
    ...(venue.moderation || {}),
    note: note || venue.moderation?.note,
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await venue.save();

  await logAdminAction({
    req,
    action: "venue.status.update",
    entityType: "venue",
    entityId: venue._id,
    metadata: {
      previousStatus,
      newStatus: isActive,
      note,
    },
  });

  res.status(200).json({
    success: true,
    message: "Venue status updated successfully",
    data: {
      id: venue._id,
      isActive: venue.isActive,
    },
  });
});

export const updateAdminVenueFeatured = asyncHandler(async (req, res) => {
  const { isFeatured } = req.body;

  if (typeof isFeatured !== "boolean") {
    return res.status(400).json({ success: false, message: "isFeatured must be a boolean" });
  }

  const venue = await Venue.findById(req.params.venueId);
  if (!venue) {
    return res.status(404).json({ success: false, message: "Venue not found" });
  }

  const previousValue = venue.isFeatured;
  venue.isFeatured = isFeatured;
  venue.moderation = {
    ...(venue.moderation || {}),
    moderatedAt: new Date(),
    moderatedBy: req.user._id,
  };
  await venue.save();

  await logAdminAction({
    req,
    action: "venue.featured.update",
    entityType: "venue",
    entityId: venue._id,
    metadata: {
      previousValue,
      newValue: isFeatured,
    },
  });

  res.status(200).json({
    success: true,
    message: "Venue featured flag updated",
    data: {
      id: venue._id,
      isFeatured: venue.isFeatured,
    },
  });
});

export const getAdminBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { status, venueId, dateFrom, dateTo } = req.query;

  const venueMatch = {};
  const bookingMatch = {};

  if (venueId && mongoose.Types.ObjectId.isValid(venueId)) {
    venueMatch._id = new mongoose.Types.ObjectId(venueId);
  }

  if (status && ALLOWED_BOOKING_STATUSES.includes(status)) {
    bookingMatch["bookings.status"] = status;
  }

  Object.assign(bookingMatch, buildDateRangeMatch(dateFrom, dateTo, "bookings.startTime"));

  const result = await Venue.aggregate([
    { $match: venueMatch },
    { $unwind: { path: "$bookings", preserveNullAndEmptyArrays: false } },
    { $match: bookingMatch },
    {
      $facet: {
        data: [
          { $sort: { "bookings.bookingDate": -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "bookings.user",
              foreignField: "_id",
              as: "bookingUser",
              pipeline: [{ $project: { name: 1, email: 1, username: 1, avatar: 1 } }],
            },
          },
          {
            $lookup: {
              from: "events",
              localField: "bookings.event",
              foreignField: "_id",
              as: "bookingEvent",
              pipeline: [{ $project: { name: 1, date: 1, status: 1 } }],
            },
          },
          {
            $project: {
              _id: 0,
              bookingId: "$bookings._id",
              status: "$bookings.status",
              startTime: "$bookings.startTime",
              endTime: "$bookings.endTime",
              amount: "$bookings.amount",
              totalAmount: "$bookings.totalAmount",
              duration: "$bookings.duration",
              notes: "$bookings.notes",
              bookingDate: "$bookings.bookingDate",
              venue: {
                _id: "$_id",
                name: "$name",
                location: "$location",
              },
              user: { $arrayElemAt: ["$bookingUser", 0] },
              event: { $arrayElemAt: ["$bookingEvent", 0] },
            },
          },
        ],
        total: [{ $count: "count" }],
        stats: [
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              pending: {
                $sum: {
                  $cond: [{ $eq: ["$bookings.status", "pending"] }, 1, 0],
                },
              },
              confirmed: {
                $sum: {
                  $cond: [{ $eq: ["$bookings.status", "confirmed"] }, 1, 0],
                },
              },
              cancelled: {
                $sum: {
                  $cond: [{ $eq: ["$bookings.status", "cancelled"] }, 1, 0],
                },
              },
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ["$bookings.status", "confirmed"] },
                    { $ifNull: ["$bookings.totalAmount", { $ifNull: ["$bookings.amount", 0] }] },
                    0,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  const response = result[0] || { data: [], total: [], stats: [] };
  const total = response.total[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: response.data,
    stats: response.stats[0] || {
      totalBookings: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      totalRevenue: 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const updateAdminBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid booking status" });
  }

  const venue = await Venue.findById(req.params.venueId);
  if (!venue) {
    return res.status(404).json({ success: false, message: "Venue not found" });
  }

  const booking = venue.bookings.id(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const previousStatus = booking.status;
  booking.status = status;
  await venue.save();

  await logAdminAction({
    req,
    action: "booking.status.update",
    entityType: "booking",
    entityId: booking._id,
    metadata: {
      venueId: venue._id,
      previousStatus,
      newStatus: status,
    },
  });

  res.status(200).json({
    success: true,
    message: "Booking status updated successfully",
    data: {
      bookingId: booking._id,
      status: booking.status,
      venueId: venue._id,
    },
  });
});

export const getAdminNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { status, type, priority, search } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;

  if (search && search.trim().length >= 2) {
    query.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { message: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const createAdminNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type = "announcement",
    priority = "normal",
    recipients = "all",
    specificRecipientIds = [],
    metadata = {},
    scheduledAt,
    sendNow = false,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required" });
  }

  if (!ALLOWED_NOTIFICATION_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid notification type" });
  }

  if (!ALLOWED_NOTIFICATION_PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, message: "Invalid notification priority" });
  }

  if (!ALLOWED_NOTIFICATION_RECIPIENTS.includes(recipients)) {
    return res.status(400).json({ success: false, message: "Invalid recipients value" });
  }

  const specificRecipients = await normalizeSpecificRecipients(specificRecipientIds);
  const normalizedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;

  if (normalizedScheduledAt && Number.isNaN(normalizedScheduledAt.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid scheduledAt value" });
  }

  if (normalizedScheduledAt && normalizedScheduledAt <= new Date()) {
    return res.status(400).json({
      success: false,
      message: "scheduledAt must be in the future",
    });
  }

  if (recipients === "specific" && specificRecipients.length === 0) {
    return res.status(400).json({ success: false, message: "No valid recipients provided" });
  }

  const notification = await Notification.create({
    title,
    message,
    type,
    priority,
    recipients,
    specificRecipients,
    status: normalizedScheduledAt ? "scheduled" : "draft",
    scheduledAt: normalizedScheduledAt,
    metadata: metadata || {},
    createdBy: req.user._id,
  });

  let delivery = null;
  if (sendNow && !normalizedScheduledAt) {
    delivery = await dispatchAdminNotification(notification);
  }

  await logAdminAction({
    req,
    action: "notification.create",
    entityType: "notification",
    entityId: notification._id,
    metadata: {
      type,
      priority,
      recipients,
      sentImmediately: Boolean(sendNow && !normalizedScheduledAt),
    },
  });

  res.status(201).json({
    success: true,
    message: sendNow && !scheduledAt ? "Notification created and sent" : "Notification created successfully",
    data: notification,
    delivery,
  });
});

export const sendAdminNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  if (notification.status === "sent") {
    return res.status(400).json({ success: false, message: "Notification has already been sent" });
  }

  const delivery = await dispatchAdminNotification(notification);

  await logAdminAction({
    req,
    action: "notification.send",
    entityType: "notification",
    entityId: notification._id,
    metadata: {
      delivered: delivery.delivered,
    },
  });

  res.status(200).json({
    success: true,
    message: "Notification sent successfully",
    data: {
      id: notification._id,
      status: notification.status,
      delivered: delivery.delivered,
    },
  });
});

export const getAdminAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { action, entityType, status, adminId, dateFrom, dateTo } = req.query;

  const query = {
    ...buildDateRangeMatch(dateFrom, dateTo, "createdAt"),
  };

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (status) query.status = status;
  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    query.admin = adminId;
  }

  const [logs, total] = await Promise.all([
    AdminAuditLog.find(query)
      .populate("admin", "_id name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdminAuditLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const adminGlobalSearch = asyncHandler(async (req, res) => {
  const queryText = (req.query.q || "").trim();
  const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));

  if (queryText.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Query must be at least 2 characters long",
    });
  }

  const searchRegex = new RegExp(queryText, "i");

  const [users, events, communities, venues] = await Promise.all([
    User.find({
      $or: [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ],
    })
      .select("_id name username email role accountStatus")
      .limit(limit)
      .lean(),
    Event.find({
      $or: [{ name: searchRegex }, { description: searchRegex }, { "location.city": searchRegex }],
    })
      .select("_id name category status date")
      .limit(limit)
      .lean(),
    Community.find({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .select("_id name category isPrivate isActive")
      .limit(limit)
      .lean(),
    Venue.find({
      $or: [{ name: searchRegex }, { description: searchRegex }, { "location.city": searchRegex }],
    })
      .select("_id name isActive isVerified location.city")
      .limit(limit)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      events,
      communities,
      venues,
    },
    counts: {
      users: users.length,
      events: events.length,
      communities: communities.length,
      venues: venues.length,
      total: users.length + events.length + communities.length + venues.length,
    },
  });
});

export const getAdminSystemHealth = asyncHandler(async (req, res) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  let dbStats = null;
  try {
    if (mongoose.connection?.db) {
      dbStats = await mongoose.connection.db.stats();
    }
  } catch (error) {
    dbStats = { error: error.message };
  }

  res.status(200).json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      process: {
        nodeVersion: process.version,
        pid: process.pid,
        memory: {
          rss: memory.rss,
          heapTotal: memory.heapTotal,
          heapUsed: memory.heapUsed,
          external: memory.external,
        },
      },
      database: {
        state: mongoose.connection.readyState,
        name: mongoose.connection.name,
        stats: dbStats,
      },
    },
  });
});
