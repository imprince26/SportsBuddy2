import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import EventPayment from "../models/eventPaymentModel.js";
import Community from "../models/communityModel.js";
import Venue from "../models/venueModel.js";
import Notification from "../models/notificationModel.js";
import AdminAuditLog from "../models/adminAuditLogModel.js";
import { logAdminAction } from "../utils/adminAudit.js";
import { addUserNotification } from "../utils/notificationHelper.js";
import {
  dispatchAdminNotification,
  normalizeSpecificRecipients,
} from "../services/adminNotificationService.js";

const ALLOWED_EVENT_STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const ALLOWED_USER_ROLES = ["user", "admin"];
const ALLOWED_ACCOUNT_STATUSES = ["active", "suspended", "banned"];
const ALLOWED_NOTIFICATION_TYPES = ["announcement", "system", "event", "marketing", "urgent"];
const ALLOWED_USER_NOTIFICATION_TYPES = ["announcement", "system", "event", "marketing"];
const ALLOWED_NOTIFICATION_PRIORITIES = ["low", "normal", "high"];
const ALLOWED_NOTIFICATION_RECIPIENTS = ["all", "users", "admins", "specific"];
const ALLOWED_BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];
const ALLOWED_EVENT_PAYMENT_STATUSES = ["created", "paid", "failed", "cancelled", "refunded"];

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

const fillDailyMetricSeries = (series, startDate, metricKeys = ["count"]) => {
  const map = new Map(series.map((item) => [item.date, item]));
  const result = [];
  const current = new Date(startDate);
  const end = new Date();

  while (current <= end) {
    const dateKey = current.toISOString().slice(0, 10);
    const source = map.get(dateKey) || {};
    const entry = { date: dateKey };
    metricKeys.forEach((key) => {
      entry[key] = Number(source[key]) || 0;
    });
    result.push(entry);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
};

export const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const [
    usersSummary,
    eventsSummary,
    communitiesSummary,
    venuesSummary,
    eventPaymentsSummary,
    bookingsSummary,
    notificationsSummary,
    auditSummary,
    eventCategories,
    eventStatuses,
    communityCategories,
    venueCities,
    recentUsers,
    upcomingEvents,
    topVenues,
    topCommunities,
    recentPayments,
    recentAuditLogs,
  ] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$accountStatus", "active"] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ["$accountStatus", "suspended"] }, 1, 0] } },
          banned: { $sum: { $cond: [{ $eq: ["$accountStatus", "banned"] }, 1, 0] } },
          admins: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$role", "admin"] }, { $eq: ["$accountStatus", "active"] }] },
                1,
                0,
              ],
            },
          },
          newLast7Days: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
          newLast30Days: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
          profilePhotos: { $sum: { $cond: [{ $ne: ["$avatar.url", null] }, 1, 0] } },
        },
      },
    ]),
    Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $in: ["$status", ["Upcoming", "Ongoing"]] }, 1, 0] } },
          upcoming: { $sum: { $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          paidEvents: { $sum: { $cond: [{ $gt: [{ $ifNull: ["$registrationFee", 0] }, 0] }, 1, 0] } },
          totalParticipants: { $sum: { $size: { $ifNull: ["$participants", []] } } },
          totalCapacity: { $sum: { $ifNull: ["$maxParticipants", 0] } },
          startingSoon: { $sum: { $cond: [{ $and: [{ $gte: ["$date", now] }, { $lte: ["$date", new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)] }] }, 1, 0] } },
        },
      },
    ]),
    Community.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          private: { $sum: { $cond: ["$isPrivate", 1, 0] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          totalMembers: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$members", []] },
                  as: "member",
                  cond: { $eq: ["$$member.isActive", true] },
                },
              },
            },
          },
          totalPosts: { $sum: { $size: { $ifNull: ["$posts", []] } } },
          pendingJoinRequests: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$joinRequests", []] },
                  as: "request",
                  cond: { $eq: ["$$request.status", "pending"] },
                },
              },
            },
          },
        },
      },
    ]),
    Venue.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
          verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
          unverified: { $sum: { $cond: ["$isVerified", 0, 1] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          totalBookings: { $sum: { $size: { $ifNull: ["$bookings", []] } } },
          pendingBookings: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$bookings", []] },
                  as: "booking",
                  cond: { $eq: ["$$booking.status", "pending"] },
                },
              },
            },
          },
        },
      },
    ]),
    EventPayment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "created"] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, { $ifNull: ["$amount", 0] }, 0],
            },
          },
          averagePaidAmount: {
            $avg: {
              $cond: [{ $eq: ["$status", "paid"] }, { $ifNull: ["$amount", 0] }, null],
            },
          },
        },
      },
    ]),
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
          pendingBookings: {
            $sum: {
              $cond: [{ $eq: ["$bookings.status", "pending"] }, 1, 0],
            },
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ["$bookings.status", "cancelled"] }, 1, 0],
            },
          },
          totalHours: { $sum: { $ifNull: ["$bookings.duration", 0] } },
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
          draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          totalRecipients: { $sum: { $ifNull: ["$recipientCount", 0] } },
          delivered: { $sum: { $ifNull: ["$deliveredCount", 0] } },
          read: { $sum: { $ifNull: ["$readCount", 0] } },
        },
      },
    ]),
    AdminAuditLog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          last24Hours: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", new Date(Date.now() - 24 * 60 * 60 * 1000)] }, 1, 0],
            },
          },
        },
      },
    ]),
    Event.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 8 }]),
    Event.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]),
    Community.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 8 }]),
    Venue.aggregate([{ $group: { _id: "$location.city", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 8 }]),
    User.find()
      .select("_id name username email avatar role accountStatus createdAt lastLoginAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Event.find({ status: { $in: ["Upcoming", "Ongoing"] }, date: { $gte: now } })
      .select("_id name category date time status images location participants maxParticipants registrationFee isFeatured")
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    Venue.aggregate([
      {
        $project: {
          name: 1,
          location: 1,
          sports: 1,
          isVerified: 1,
          isActive: 1,
          isFeatured: 1,
          primaryImage: { $arrayElemAt: ["$images", 0] },
          bookingCount: { $size: { $ifNull: ["$bookings", []] } },
          confirmedBookings: {
            $size: {
              $filter: {
                input: { $ifNull: ["$bookings", []] },
                as: "booking",
                cond: { $eq: ["$$booking.status", "confirmed"] },
              },
            },
          },
          pendingBookings: {
            $size: {
              $filter: {
                input: { $ifNull: ["$bookings", []] },
                as: "booking",
                cond: { $eq: ["$$booking.status", "pending"] },
              },
            },
          },
          bookingRevenue: {
            $reduce: {
              input: { $ifNull: ["$bookings", []] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.status", "confirmed"] },
                      { $ifNull: ["$$this.totalAmount", { $ifNull: ["$$this.amount", 0] }] },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { bookingRevenue: -1, bookingCount: -1, isFeatured: -1 } },
      { $limit: 5 },
    ]),
    Community.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          location: 1,
          image: 1,
          isActive: 1,
          isFeatured: 1,
          memberCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$members", []] },
                as: "member",
                cond: { $eq: ["$$member.isActive", true] },
              },
            },
          },
          postCount: { $size: { $ifNull: ["$posts", []] } },
          joinRequestCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$joinRequests", []] },
                as: "request",
                cond: { $eq: ["$$request.status", "pending"] },
              },
            },
          },
        },
      },
      { $sort: { memberCount: -1, postCount: -1, isFeatured: -1 } },
      { $limit: 5 },
    ]),
    EventPayment.find()
      .populate("event", "_id name category date images location")
      .populate("user", "_id name email avatar")
      .select("_id event user amount currency status paymentMethod createdAt paidAt razorpayPaymentId")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    AdminAuditLog.find()
      .populate("admin", "_id name email role")
      .select("_id action entityType status admin ipAddress createdAt errorMessage")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const users = usersSummary[0] || {
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    admins: 0,
    newLast7Days: 0,
    newLast30Days: 0,
    profilePhotos: 0,
  };
  const events = eventsSummary[0] || {
    total: 0,
    active: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    featured: 0,
    paidEvents: 0,
    totalParticipants: 0,
    totalCapacity: 0,
    startingSoon: 0,
  };
  const communities = communitiesSummary[0] || {
    total: 0,
    active: 0,
    private: 0,
    featured: 0,
    totalMembers: 0,
    totalPosts: 0,
    pendingJoinRequests: 0,
  };
  const venues = venuesSummary[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    featured: 0,
    totalBookings: 0,
    pendingBookings: 0,
  };
  const eventPayments = eventPaymentsSummary[0] || {
    total: 0,
    paid: 0,
    failed: 0,
    pending: 0,
    refunded: 0,
    cancelled: 0,
    paidRevenue: 0,
    averagePaidAmount: 0,
  };
  const bookings = bookingsSummary[0] || {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalHours: 0,
    totalRevenue: 0,
  };
  const notifications = notificationsSummary[0] || {
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    failed: 0,
    highPriority: 0,
    totalRecipients: 0,
    delivered: 0,
    read: 0,
  };
  const audits = auditSummary[0] || { total: 0, success: 0, failed: 0, last24Hours: 0 };

  res.status(200).json({
    success: true,
    data: {
      users: {
        ...users,
        activeRate: users.total > 0 ? Math.round((users.active / users.total) * 100) : 0,
        profileCompletionRate: users.total > 0 ? Math.round((users.profilePhotos / users.total) * 100) : 0,
      },
      events: {
        ...events,
        fillRate: events.totalCapacity > 0 ? Math.round((events.totalParticipants / events.totalCapacity) * 100) : 0,
        freeEvents: Math.max(0, events.total - events.paidEvents),
      },
      communities: {
        ...communities,
        averageMembers: communities.total > 0 ? Math.round(communities.totalMembers / communities.total) : 0,
      },
      venues: {
        ...venues,
        verificationRate: venues.total > 0 ? Math.round((venues.verified / venues.total) * 100) : 0,
      },
      eventPayments,
      bookings: {
        ...bookings,
        confirmationRate: bookings.totalBookings > 0 ? Math.round((bookings.confirmedBookings / bookings.totalBookings) * 100) : 0,
      },
      notifications: {
        ...notifications,
        deliveryRate:
          notifications.totalRecipients > 0 ? Math.round((notifications.delivered / notifications.totalRecipients) * 100) : 0,
        readRate: notifications.totalRecipients > 0 ? Math.round((notifications.read / notifications.totalRecipients) * 100) : 0,
      },
      audits,
      breakdowns: {
        eventCategories: eventCategories.map((item) => ({ category: item._id || "Unknown", count: item.count })),
        eventStatuses: eventStatuses.map((item) => ({ status: item._id || "Unknown", count: item.count })),
        communityCategories: communityCategories.map((item) => ({ category: item._id || "Unknown", count: item.count })),
        venueCities: venueCities.map((item) => ({ city: item._id || "Unknown", count: item.count })),
      },
      highlights: {
        recentUsers,
        upcomingEvents: upcomingEvents.map((event) => ({
          ...event,
          primaryImage: Array.isArray(event.images) ? event.images[0] || null : null,
          participantCount: Array.isArray(event.participants) ? event.participants.length : 0,
          fillRate:
            Number(event.maxParticipants) > 0 && Array.isArray(event.participants)
              ? Math.round((event.participants.length / Number(event.maxParticipants)) * 100)
              : 0,
          images: undefined,
          participants: undefined,
        })),
        topVenues,
        topCommunities,
        recentPayments: recentPayments.map((payment) => ({
          ...payment,
          eventName: payment.event?.name || "Unknown event",
          eventImage: payment.event?.images?.[0] || null,
          userName: payment.user?.name || "Unknown user",
          userEmail: payment.user?.email || "",
        })),
        recentAuditLogs,
      },
      actionQueue: {
        venueReviews: venues.unverified,
        pendingBookings: bookings.pendingBookings,
        failedPayments: eventPayments.failed,
        scheduledNotifications: notifications.scheduled,
        failedAuditLogs: audits.failed,
        pendingJoinRequests: communities.pendingJoinRequests,
      },
    },
  });
});

export const getAdminEventPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const { search, status, eventId, userId, dateFrom, dateTo } = req.query;

  const sort = parseSort(
    req.query.sortBy,
    {
      createdAt: "createdAt",
      paidAt: "paidAt",
      amount: "amount",
      status: "status",
    },
    { createdAt: -1 }
  );

  const query = {
    ...buildDateRangeMatch(dateFrom, dateTo, "createdAt"),
  };

  if (status && ALLOWED_EVENT_PAYMENT_STATUSES.includes(status)) {
    query.status = status;
  }

  if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
    query.event = eventId;
  }

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    query.user = userId;
  }

  if (search && search.trim().length >= 2) {
    const searchRegex = new RegExp(search.trim(), "i");
    const [matchedUsers, matchedEvents] = await Promise.all([
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { username: searchRegex },
        ],
      })
        .select("_id")
        .limit(200)
        .lean(),
      Event.find({
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { "location.city": searchRegex },
        ],
      })
        .select("_id")
        .limit(200)
        .lean(),
    ]);

    const userIds = matchedUsers.map((entry) => entry._id);
    const eventIds = matchedEvents.map((entry) => entry._id);

    query.$or = [
      { razorpayOrderId: searchRegex },
      { razorpayPaymentId: searchRegex },
      { receipt: searchRegex },
      { failureReason: searchRegex },
      ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
      ...(eventIds.length > 0 ? [{ event: { $in: eventIds } }] : []),
    ];
  }

  const [payments, total, stats, statusBreakdown, methodBreakdown] = await Promise.all([
    EventPayment.find(query)
      .populate("event", "_id name category date status registrationFee images location")
      .populate("user", "_id name username email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    EventPayment.countDocuments(query),
    EventPayment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "created"] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] } },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, { $ifNull: ["$amount", 0] }, 0],
            },
          },
        },
      },
    ]),
    EventPayment.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: { $ifNull: ["$amount", 0] } } } },
      { $sort: { count: -1 } },
    ]),
    EventPayment.aggregate([
      { $match: query },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);

  const mappedPayments = payments.map((payment) => ({
    ...payment,
    eventName: payment.event?.name || "Unknown event",
    eventImage: payment.event?.images?.[0] || null,
    eventCity: payment.event?.location?.city || "",
    userName: payment.user?.name || "Unknown user",
    userEmail: payment.user?.email || "",
    webhookEventCount: Array.isArray(payment.webhookEvents) ? payment.webhookEvents.length : 0,
  }));

  res.status(200).json({
    success: true,
    data: mappedPayments,
    stats: stats[0] || {
      total: 0,
      paid: 0,
      failed: 0,
      pending: 0,
      refunded: 0,
      paidRevenue: 0,
    },
    breakdowns: {
      statuses: statusBreakdown.map((item) => ({
        status: item._id || "unknown",
        count: item.count,
        amount: item.amount,
      })),
      paymentMethods: methodBreakdown.map((item) => ({
        method: item._id || "unknown",
        count: item.count,
      })),
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

export const getAdminEventPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await EventPayment.findById(req.params.paymentId)
    .populate("event", "_id name category date status registrationFee maxParticipants participants")
    .populate("user", "_id name username email avatar accountStatus")
    .lean();

  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

export const getAdminGrowthAnalytics = asyncHandler(async (req, res) => {
  const rangeInDays = Math.max(7, Math.min(180, Number.parseInt(req.query.days, 10) || 30));
  const startDate = new Date(Date.now() - rangeInDays * 24 * 60 * 60 * 1000);

  const [
    userSeries,
    eventSeries,
    communitySeries,
    venueSeries,
    bookingSeries,
    paymentSeries,
    notificationSeries,
    auditSeries,
  ] = await Promise.all([
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
    Community.aggregate([
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
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, verified: 1 } },
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
    EventPayment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, { $ifNull: ["$amount", 0] }, 0],
            },
          },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, paid: 1, failed: 1, revenue: 1 } },
      { $sort: { date: 1 } },
    ]),
    Notification.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: { $sum: { $ifNull: ["$deliveredCount", 0] } },
          read: { $sum: { $ifNull: ["$readCount", 0] } },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, sent: 1, delivered: 1, read: 1 } },
      { $sort: { date: 1 } },
    ]),
    AdminAuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, failed: 1, success: 1 } },
      { $sort: { date: 1 } },
    ]),
  ]);

  const filledUsers = fillDailySeries(userSeries, startDate);
  const filledEvents = fillDailySeries(eventSeries, startDate);
  const filledCommunities = fillDailySeries(communitySeries, startDate);
  const filledVenues = fillDailyMetricSeries(venueSeries, startDate, ["count", "verified"]);
  const filledBookings = fillDailyMetricSeries(bookingSeries, startDate, ["count", "revenue"]);
  const filledPayments = fillDailyMetricSeries(paymentSeries, startDate, ["count", "paid", "failed", "revenue"]);
  const filledNotifications = fillDailyMetricSeries(notificationSeries, startDate, ["count", "sent", "delivered", "read"]);
  const filledAuditLogs = fillDailyMetricSeries(auditSeries, startDate, ["count", "success", "failed"]);

  res.status(200).json({
    success: true,
    data: {
      days: rangeInDays,
      users: filledUsers,
      events: filledEvents,
      communities: filledCommunities,
      venues: filledVenues,
      bookings: filledBookings,
      payments: filledPayments,
      notifications: filledNotifications,
      auditLogs: filledAuditLogs,
      summary: {
        users: filledUsers.reduce((sum, item) => sum + item.count, 0),
        events: filledEvents.reduce((sum, item) => sum + item.count, 0),
        communities: filledCommunities.reduce((sum, item) => sum + item.count, 0),
        venues: filledVenues.reduce((sum, item) => sum + item.count, 0),
        bookings: filledBookings.reduce((sum, item) => sum + item.count, 0),
        bookingRevenue: filledBookings.reduce((sum, item) => sum + item.revenue, 0),
        paymentRevenue: filledPayments.reduce((sum, item) => sum + item.revenue, 0),
        failedPayments: filledPayments.reduce((sum, item) => sum + item.failed, 0),
        auditFailures: filledAuditLogs.reduce((sum, item) => sum + item.failed, 0),
      },
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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [users, total, stats] = await Promise.all([
    User.find(query)
      .select("name username email phone role accountStatus avatar createdAt lastLoginAt stats moderation sportsPreferences location bio followers following notifications")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { accountStatus: "active" } }, { $count: "count" }],
          suspended: [{ $match: { accountStatus: "suspended" } }, { $count: "count" }],
          banned: [{ $match: { accountStatus: "banned" } }, { $count: "count" }],
          admins: [{ $match: { role: "admin" } }, { $count: "count" }],
          newLast30Days: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: "count" }],
        },
      },
    ]),
  ]);

  const counts = stats[0] || {};
  const getCount = (key) => counts[key]?.[0]?.count || 0;

  const mappedUsers = users.map((user) => ({
    ...user,
    followerCount: Array.isArray(user.followers) ? user.followers.length : 0,
    followingCount: Array.isArray(user.following) ? user.following.length : 0,
    unreadNotificationsCount: Array.isArray(user.notifications)
      ? user.notifications.filter((notification) => !notification.read).length
      : 0,
    followers: undefined,
    following: undefined,
    notifications: undefined,
  }));

  res.status(200).json({
    success: true,
    data: mappedUsers,
    stats: {
      total: getCount("total"),
      active: getCount("active"),
      suspended: getCount("suspended"),
      banned: getCount("banned"),
      admins: getCount("admins"),
      newLast30Days: getCount("newLast30Days"),
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

export const sendAdminUserNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type = "system",
    priority = "normal",
    actionUrl,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required" });
  }

  if (!ALLOWED_USER_NOTIFICATION_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid notification type" });
  }

  if (!ALLOWED_NOTIFICATION_PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, message: "Invalid notification priority" });
  }

  const user = await User.findById(req.params.userId).select("_id name email accountStatus").lean();
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.accountStatus === "banned") {
    return res.status(400).json({ success: false, message: "Cannot notify a banned account" });
  }

  const delivered = await addUserNotification(user._id.toString(), {
    title,
    message,
    type,
    priority,
    actionUrl,
  });

  if (!delivered) {
    return res.status(500).json({ success: false, message: "Failed to deliver notification" });
  }

  await logAdminAction({
    req,
    action: "user.notification.send",
    entityType: "user",
    entityId: user._id,
    metadata: {
      title,
      type,
      priority,
      actionUrl,
    },
  });

  res.status(200).json({
    success: true,
    message: "Notification sent successfully",
    data: {
      userId: user._id,
      delivered: true,
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

  const [events, total, statsResult, categoryBreakdown] = await Promise.all([
    Event.find(query)
      .populate("createdBy", "_id name username email")
      .populate("venue", "_id name location")
      .populate("community", "_id name image")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query),
    Event.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: { $sum: { $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          withImages: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$images", []] } }, 0] }, 1, 0],
            },
          },
          paidEvents: { $sum: { $cond: [{ $gt: [{ $ifNull: ["$registrationFee", 0] }, 0] }, 1, 0] } },
          totalParticipants: { $sum: { $size: { $ifNull: ["$participants", []] } } },
          totalWaitlist: { $sum: { $size: { $ifNull: ["$waitlist", []] } } },
          totalCapacity: { $sum: { $ifNull: ["$maxParticipants", 0] } },
        },
      },
    ]),
    Event.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);

  const mappedEvents = events.map((event) => {
    const participants = Array.isArray(event.participants) ? event.participants : [];
    const ratings = Array.isArray(event.ratings) ? event.ratings : [];
    const waitlist = Array.isArray(event.waitlist) ? event.waitlist : [];
    const images = Array.isArray(event.images) ? event.images : [];
    const maxParticipants = Number(event.maxParticipants) || 0;
    const participantCount = participants.length;

    return {
      ...event,
      primaryImage: images[0] || null,
      imageCount: images.length,
      participantCount,
      ratingsCount: ratings.length,
      averageRating:
        ratings.length > 0
          ? Number((ratings.reduce((sum, entry) => sum + (entry.rating || 0), 0) / ratings.length).toFixed(1))
          : 0,
      waitlistCount: waitlist.length,
      fillRate: maxParticipants > 0 ? Math.min(100, Math.round((participantCount / maxParticipants) * 100)) : 0,
      paymentType: Number(event.registrationFee) > 0 ? "paid" : "free",
    };
  });

  const stats = statsResult[0] || {
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    featured: 0,
    withImages: 0,
    paidEvents: 0,
    totalParticipants: 0,
    totalWaitlist: 0,
    totalCapacity: 0,
  };

  res.status(200).json({
    success: true,
    data: mappedEvents,
    stats: {
      ...stats,
      freeEvents: Math.max(0, (stats.total || 0) - (stats.paidEvents || 0)),
      fillRate: stats.totalCapacity > 0 ? Math.round((stats.totalParticipants / stats.totalCapacity) * 100) : 0,
    },
    breakdowns: {
      categories: categoryBreakdown.map((item) => ({
        category: item._id || "Uncategorized",
        count: item.count,
      })),
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

  const [communities, total, statsResult, categoryBreakdown] = await Promise.all([
    Community.find(query)
      .populate("creator", "_id name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Community.countDocuments(query),
    Community.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
          private: { $sum: { $cond: ["$isPrivate", 1, 0] } },
          public: { $sum: { $cond: ["$isPrivate", 0, 1] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          withImages: { $sum: { $cond: [{ $ifNull: ["$image.url", false] }, 1, 0] } },
          totalMembers: { $sum: { $size: { $ifNull: ["$members", []] } } },
          totalPosts: { $sum: { $size: { $ifNull: ["$posts", []] } } },
          totalEvents: { $sum: { $size: { $ifNull: ["$events", []] } } },
          pendingJoinRequests: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$joinRequests", []] },
                  as: "request",
                  cond: { $eq: ["$$request.status", "pending"] },
                },
              },
            },
          },
        },
      },
    ]),
    Community.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);

  const mappedCommunities = communities.map((community) => {
    const members = Array.isArray(community.members) ? community.members : [];
    const posts = Array.isArray(community.posts) ? community.posts : [];
    const events = Array.isArray(community.events) ? community.events : [];
    const joinRequests = Array.isArray(community.joinRequests) ? community.joinRequests : [];

    return {
      ...community,
      primaryImage: community.image || null,
      activeMemberCount: members.filter((member) => member.isActive).length,
      moderatorCount:
        (Array.isArray(community.admins) ? community.admins.length : 0) +
        (Array.isArray(community.moderators) ? community.moderators.length : 0),
      postCount: posts.length,
      eventCount: events.length,
      joinRequestCount: joinRequests.filter((request) => request.status === "pending").length,
      pinnedPostCount: posts.filter((post) => post.isPinned).length,
      engagementScore: members.length > 0 ? Math.round(((posts.length + events.length) / members.length) * 100) : 0,
    };
  });

  const stats = statsResult[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    private: 0,
    public: 0,
    featured: 0,
    withImages: 0,
    totalMembers: 0,
    totalPosts: 0,
    totalEvents: 0,
    pendingJoinRequests: 0,
  };

  res.status(200).json({
    success: true,
    data: mappedCommunities,
    stats,
    breakdowns: {
      categories: categoryBreakdown.map((item) => ({
        category: item._id || "Uncategorized",
        count: item.count,
      })),
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

  const [venues, total, statsResult, cityBreakdown, sportBreakdown] = await Promise.all([
    Venue.find(query)
      .populate("owner", "_id name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Venue.countDocuments(query),
    Venue.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
          verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
          unverified: { $sum: { $cond: ["$isVerified", 0, 1] } },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          withImages: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$images", []] } }, 0] }, 1, 0],
            },
          },
          totalCapacity: { $sum: { $ifNull: ["$capacity", 0] } },
          totalBookings: { $sum: { $size: { $ifNull: ["$bookings", []] } } },
          confirmedBookings: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$bookings", []] },
                  as: "booking",
                  cond: { $eq: ["$$booking.status", "confirmed"] },
                },
              },
            },
          },
          bookingRevenue: {
            $sum: {
              $reduce: {
                input: { $ifNull: ["$bookings", []] },
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $cond: [
                        { $eq: ["$$this.status", "confirmed"] },
                        { $ifNull: ["$$this.totalAmount", { $ifNull: ["$$this.amount", 0] }] },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]),
    Venue.aggregate([
      { $match: query },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    Venue.aggregate([
      { $match: query },
      { $unwind: { path: "$sports", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$sports", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
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
      primaryImage: Array.isArray(venue.images) ? venue.images[0] || null : null,
      imageCount: Array.isArray(venue.images) ? venue.images.length : 0,
      averageRating,
      ratingsCount: ratings.length,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
      bookingRevenue: bookings.reduce((sum, booking) => {
        if (booking.status !== "confirmed") return sum;
        return sum + (booking.totalAmount || booking.amount || 0);
      }, 0),
    };
  });

  const stats = statsResult[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    featured: 0,
    withImages: 0,
    totalCapacity: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    bookingRevenue: 0,
  };

  res.status(200).json({
    success: true,
    data: mappedVenues,
    stats,
    breakdowns: {
      cities: cityBreakdown.map((item) => ({
        city: item._id || "Unknown",
        count: item.count,
      })),
      sports: sportBreakdown.map((item) => ({
        sport: item._id || "Other",
        count: item.count,
      })),
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
  const { status, venueId, dateFrom, dateTo, search, city } = req.query;

  const venueMatch = {};
  const bookingMatch = {};

  if (venueId && mongoose.Types.ObjectId.isValid(venueId)) {
    venueMatch._id = new mongoose.Types.ObjectId(venueId);
  }

  if (city) {
    venueMatch["location.city"] = { $regex: city.trim(), $options: "i" };
  }

  if (status && ALLOWED_BOOKING_STATUSES.includes(status)) {
    bookingMatch["bookings.status"] = status;
  }

  Object.assign(bookingMatch, buildDateRangeMatch(dateFrom, dateTo, "bookings.startTime"));

  const pipeline = [
    { $match: venueMatch },
    { $unwind: { path: "$bookings", preserveNullAndEmptyArrays: false } },
    { $match: bookingMatch },
    {
      $lookup: {
        from: "users",
        localField: "bookings.user",
        foreignField: "_id",
        as: "bookingUser",
        pipeline: [{ $project: { name: 1, email: 1, username: 1, avatar: 1, phone: 1 } }],
      },
    },
    {
      $lookup: {
        from: "events",
        localField: "bookings.event",
        foreignField: "_id",
        as: "bookingEvent",
        pipeline: [{ $project: { name: 1, date: 1, status: 1, category: 1, images: 1 } }],
      },
    },
  ];

  if (search && search.trim().length >= 2) {
    const searchRegex = new RegExp(search.trim(), "i");
    pipeline.push({
      $match: {
        $or: [
          { name: searchRegex },
          { "location.city": searchRegex },
          { "location.address": searchRegex },
          { "bookings.notes": searchRegex },
          { "bookingUser.name": searchRegex },
          { "bookingUser.email": searchRegex },
          { "bookingUser.username": searchRegex },
          { "bookingEvent.name": searchRegex },
        ],
      },
    });
  }

  const result = await Venue.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [
          { $sort: { "bookings.bookingDate": -1 } },
          { $skip: skip },
          { $limit: limit },
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
                sports: "$sports",
                pricing: "$pricing",
                primaryImage: { $arrayElemAt: ["$images", 0] },
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
              totalHours: { $sum: { $ifNull: ["$bookings.duration", 0] } },
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
              averageAmount: {
                $avg: {
                  $ifNull: ["$bookings.totalAmount", { $ifNull: ["$bookings.amount", 0] }],
                },
              },
            },
          },
        ],
        statusBreakdown: [
          { $group: { _id: "$bookings.status", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        cityBreakdown: [
          { $group: { _id: "$location.city", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 8 },
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
      totalHours: 0,
      averageAmount: 0,
    },
    breakdowns: {
      statuses: (response.statusBreakdown || []).map((item) => ({
        status: item._id || "unknown",
        count: item.count,
      })),
      cities: (response.cityBreakdown || []).map((item) => ({
        city: item._id || "Unknown",
        count: item.count,
      })),
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

export const getAdminNotificationRecipients = asyncHandler(async (req, res) => {
  const search = (req.query.search || "").trim();
  const role = req.query.role;
  const limit = Math.min(500, Math.max(1, Number.parseInt(req.query.limit, 10) || 200));

  const query = {
    accountStatus: "active",
  };

  if (role && ALLOWED_USER_ROLES.includes(role)) {
    query.role = role;
  }

  if (search.length >= 2) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("_id name username email role avatar")
    .sort({ name: 1, createdAt: -1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: users,
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

  const [notifications, total, statsResult, typeBreakdown, recipientBreakdown] = await Promise.all([
    Notification.find(query)
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
          scheduled: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          totalRecipients: { $sum: { $ifNull: ["$recipientCount", 0] } },
          delivered: { $sum: { $ifNull: ["$deliveredCount", 0] } },
          read: { $sum: { $ifNull: ["$readCount", 0] } },
          failedDeliveries: { $sum: { $ifNull: ["$failedCount", 0] } },
          clicks: { $sum: { $ifNull: ["$statistics.clicks", 0] } },
        },
      },
    ]),
    Notification.aggregate([
      { $match: query },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Notification.aggregate([
      { $match: query },
      { $group: { _id: "$recipients", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
  ]);

  const mappedNotifications = notifications.map((notification) => ({
    ...notification,
    deliveryLogCount: Array.isArray(notification.deliveryLogs) ? notification.deliveryLogs.length : 0,
    calculatedReadRate:
      Number(notification.recipientCount) > 0
        ? Math.round(((notification.readCount || 0) / notification.recipientCount) * 100)
        : 0,
    actionUrl: notification.metadata?.actionUrl || "",
  }));

  const stats = statsResult[0] || {
    total: 0,
    draft: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
    highPriority: 0,
    totalRecipients: 0,
    delivered: 0,
    read: 0,
    failedDeliveries: 0,
    clicks: 0,
  };

  res.status(200).json({
    success: true,
    data: mappedNotifications,
    stats: {
      ...stats,
      readRate: stats.totalRecipients > 0 ? Math.round((stats.read / stats.totalRecipients) * 100) : 0,
      deliveryRate: stats.totalRecipients > 0 ? Math.round((stats.delivered / stats.totalRecipients) * 100) : 0,
    },
    breakdowns: {
      types: typeBreakdown.map((item) => ({ type: item._id || "unknown", count: item.count })),
      recipients: recipientBreakdown.map((item) => ({ recipients: item._id || "unknown", count: item.count })),
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

  const [logs, total, statsResult, entityBreakdown, actionBreakdown] = await Promise.all([
    AdminAuditLog.find(query)
      .populate("admin", "_id name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdminAuditLog.countDocuments(query),
    AdminAuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          uniqueAdmins: { $addToSet: "$admin" },
          uniqueEntities: { $addToSet: "$entityId" },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          success: 1,
          failed: 1,
          adminCount: { $size: "$uniqueAdmins" },
          entityCount: { $size: "$uniqueEntities" },
        },
      },
    ]),
    AdminAuditLog.aggregate([
      { $match: query },
      { $group: { _id: "$entityType", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    AdminAuditLog.aggregate([
      { $match: query },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    stats: statsResult[0] || {
      total: 0,
      success: 0,
      failed: 0,
      adminCount: 0,
      entityCount: 0,
    },
    breakdowns: {
      entities: entityBreakdown.map((item) => ({
        entityType: item._id || "unknown",
        count: item.count,
      })),
      actions: actionBreakdown.map((item) => ({
        action: item._id || "unknown",
        count: item.count,
      })),
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
