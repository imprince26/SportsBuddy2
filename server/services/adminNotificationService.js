import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import sendEmail from "../config/sendEmail.js";
import { AdminSentEmailHtml } from "../utils/emailTemplate.js";
import mongoose from "mongoose";

export const normalizeSpecificRecipients = async (recipientIds = []) => {
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return [];
  }

  const validIds = recipientIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return [];
  }

  const users = await User.find({
    _id: { $in: validIds },
    accountStatus: "active",
  }).select("_id email name");

  return users.map((user) => ({
    user: user._id,
    email: user.email,
    name: user.name,
  }));
};

const resolveNotificationRecipients = async (notification) => {
  if (notification.recipients === "all") {
    return User.find({ accountStatus: "active" }).select("_id email name");
  }

  if (notification.recipients === "users") {
    return User.find({ role: "user", accountStatus: "active" }).select("_id email name");
  }

  if (notification.recipients === "admins") {
    return User.find({ role: "admin", accountStatus: "active" }).select("_id email name");
  }

  const specificIds = (notification.specificRecipients || []).map((item) => item.user).filter(Boolean);
  if (!specificIds.length) {
    return [];
  }

  return User.find({ _id: { $in: specificIds }, accountStatus: "active" }).select("_id email name");
};

export const dispatchAdminNotification = async (notification) => {
  const users = await resolveNotificationRecipients(notification);
  const userIds = users.map((user) => user._id);

  const inAppNotification = {
    type: notification.type === "announcement" ? "system" : notification.type,
    title: notification.title,
    message: notification.message,
    relatedNotification: notification._id,
    priority: notification.priority,
    actionUrl: notification.metadata?.actionUrl,
    timestamp: new Date(),
  };

  if (userIds.length > 0) {
    await User.updateMany(
      { _id: { $in: userIds } },
      {
        $push: {
          notifications: {
            $each: [inAppNotification],
            $position: 0,
          },
        },
      }
    );
  }

  if (notification.metadata?.emailSent !== false && users.length > 0) {
    try {
      await sendEmail({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: users.map((user) => user.email),
        subject: notification.title,
        html: AdminSentEmailHtml({
          subject: notification.title,
          message: notification.message,
        }),
      });
      notification.metadata.emailSent = true;
    } catch (error) {
      notification.metadata.emailSent = false;
      notification.metadata.emailError = error.message;
    }
  }

  const deliveryLogLimit = 2000;
  notification.deliveryLogs = users.slice(0, deliveryLogLimit).map((user) => ({
    recipient: user._id,
    email: user.email,
    deliveryStatus: "delivered",
    deliveredAt: new Date(),
  }));
  notification.metadata.inAppSent = true;
  notification.metadata.deliveryLogsTruncated = users.length > deliveryLogLimit;
  notification.deliveredCount = users.length;
  notification.readCount = 0;
  notification.failedCount = 0;
  notification.status = "sent";
  notification.sentAt = new Date();
  notification.engagementRate = 0;

  await notification.save();

  return {
    delivered: users.length,
    emailsAttempted: notification.metadata?.emailSent !== false,
  };
};

export const processDueScheduledAdminNotifications = async (limit = 20) => {
  const dueNotifications = await Notification.find({
    status: "scheduled",
    scheduledAt: { $lte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  let processed = 0;
  let failed = 0;

  for (const notification of dueNotifications) {
    try {
      await dispatchAdminNotification(notification);
      processed += 1;
    } catch (error) {
      notification.status = "failed";
      notification.metadata = {
        ...(notification.metadata || {}),
        processingError: error.message,
      };
      await notification.save();
      failed += 1;
    }
  }

  return {
    due: dueNotifications.length,
    processed,
    failed,
  };
};
