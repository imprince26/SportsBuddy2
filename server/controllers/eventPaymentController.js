import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import EventPayment from "../models/eventPaymentModel.js";
import { completeUserAction, POINT_VALUES } from "../utils/userStatsHelper.js";
import { addUserNotification } from "../utils/notificationHelper.js";
import {
  formatINR,
  getRazorpayClient,
  toPaise,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../services/razorpayService.js";

const ORDER_RESERVATION_TTL_MINUTES = 15;

const buildReceipt = (eventId, userId) => {
  const eventPart = String(eventId).slice(-6);
  const userPart = String(userId).slice(-6);
  return `evt_${eventPart}_${userPart}_${Date.now()}`;
};

const getParticipantUserId = (participant) => {
  if (!participant?.user) {
    return null;
  }

  if (typeof participant.user === "object") {
    return String(participant.user._id || participant.user.id || participant.user);
  }

  return String(participant.user);
};

const isEventParticipant = (event, userId) => {
  const normalizedUserId = String(userId);
  return Array.isArray(event?.participants)
    ? event.participants.some((participant) => getParticipantUserId(participant) === normalizedUserId)
    : false;
};

const getPopulatedEvent = async (eventId) => {
  return Event.findById(eventId)
    .populate("createdBy", "name avatar username email")
    .populate("participants.user", "name avatar username email")
    .populate("teams.captain", "name avatar username")
    .populate("teams.members", "name avatar username");
};

const finalizePaidRegistration = async ({
  event,
  user,
  paymentRecord,
  io,
  actorDisplayName,
  shouldAwardPoints = true,
}) => {
  const userId = String(user._id);
  const alreadyParticipant = isEventParticipant(event, userId);

  if (alreadyParticipant) {
    return { joined: false, reason: "already_joined" };
  }

  if (event.participants.length >= event.maxParticipants) {
    return { joined: false, reason: "event_full" };
  }

  event.participants.push({
    user: user._id,
    status: "confirmed",
    joinedAt: new Date(),
    paymentStatus: "paid",
    paymentMethod: "online",
    paidAt: new Date(),
  });

  await event.save();

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { participatedEvents: event._id },
  });

  if (shouldAwardPoints) {
    try {
      await completeUserAction(user._id, {
        action: "event_join",
        points: POINT_VALUES.EVENT_JOIN,
        category: event.category || "overall",
        statUpdates: { eventsParticipated: 1 },
        relatedId: event._id,
        checkAchievements: true,
      });
    } catch (statsError) {
      // Non-blocking stats failure.
    }
  }

  await addUserNotification(user, {
    type: "event",
    title: "Payment successful",
    message: shouldAwardPoints
      ? `Your payment for "${event.name}" is confirmed, your seat is reserved, and you earned ${POINT_VALUES.EVENT_JOIN} points!`
      : `Your payment for "${event.name}" is confirmed and your seat is reserved.`,
    relatedEvent: event._id,
    priority: "normal",
    actionUrl: `/events/${event._id}`,
  });

  const organizerMessageName = actorDisplayName || user.name || "A participant";
  await User.findByIdAndUpdate(event.createdBy, {
    $push: {
      notifications: {
        type: "event",
        title: "New paid participant",
        message: `${organizerMessageName} completed payment and joined your event: ${event.name}`,
        relatedEvent: event._id,
        priority: "normal",
      },
    },
  });

  const updatedEvent = await getPopulatedEvent(event._id);

  if (io) {
    io.to(`user:${event.createdBy}`).emit("userJoinedEvent", {
      event: updatedEvent,
      user,
    });
  }

  paymentRecord.status = "paid";
  paymentRecord.failureReason = undefined;
  paymentRecord.verifiedAt = paymentRecord.verifiedAt || new Date();
  await paymentRecord.save();

  return { joined: true, updatedEvent };
};

export const createEventPaymentOrder = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const [event, user] = await Promise.all([Event.findById(eventId), User.findById(userId)]);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userPhone = String(user.phone || "").replace(/\D/g, "");
    if (!/^\d{10}$/.test(userPhone)) {
      return res.status(400).json({
        success: false,
        requiresPhone: true,
        message: "Please add your 10-digit mobile number in profile before payment",
      });
    }

    if (String(event.createdBy) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "Event organizer is already registered for this event",
      });
    }

    if (isEventParticipant(event, userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    const registrationFee = Number(event.registrationFee) || 0;
    if (registrationFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "This event does not require online payment",
      });
    }

    const reservationCutoff = new Date(Date.now() - ORDER_RESERVATION_TTL_MINUTES * 60 * 1000);

    const recentPendingPayment = await EventPayment.findOne({
      event: event._id,
      user: user._id,
      status: "created",
      createdAt: { $gte: reservationCutoff },
    }).sort({ createdAt: -1 });

    const activeReservations = await EventPayment.countDocuments({
      event: event._id,
      status: "created",
      createdAt: { $gte: reservationCutoff },
    });

    const availableSpots =
      Number(event.maxParticipants || 0) -
      Number(event.participants?.length || 0) -
      activeReservations +
      (recentPendingPayment ? 1 : 0);

    if (availableSpots <= 0 && !recentPendingPayment) {
      return res.status(400).json({
        success: false,
        message: "No seats available right now. Please try again shortly.",
      });
    }

    const razorpayClient = getRazorpayClient();
    const amountInPaise = toPaise(registrationFee);

    let razorpayOrder;
    let reusedExistingOrder = false;

    if (recentPendingPayment?.razorpayOrderId) {
      try {
        razorpayOrder = await razorpayClient.orders.fetch(recentPendingPayment.razorpayOrderId);
      } catch (fetchError) {
        razorpayOrder = null;
      }
    }

    if (!razorpayOrder || razorpayOrder.status === "paid" || Number(razorpayOrder.amount) !== amountInPaise) {
      if (recentPendingPayment) {
        recentPendingPayment.status = "cancelled";
        recentPendingPayment.failureReason = "Superseded by a new order";
        await recentPendingPayment.save();
      }

      const receipt = buildReceipt(event._id, user._id);

      razorpayOrder = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          eventId: String(event._id),
          eventName: event.name,
          userId: String(user._id),
          userEmail: user.email,
        },
      });

      await EventPayment.create({
        event: event._id,
        user: user._id,
        gateway: "razorpay",
        status: "created",
        amount: registrationFee,
        currency: "INR",
        receipt,
        razorpayOrderId: razorpayOrder.id,
        description: `Registration fee for event ${event.name}`,
        notes: razorpayOrder.notes || {},
        metadata: {
          eventName: event.name,
          eventDate: event.date,
          eventTime: event.time,
        },
      });
    } else {
      reusedExistingOrder = true;
    }

    return res.status(200).json({
      success: true,
      message: "Payment order created",
      data: {
        paymentGateway: "razorpay",
        keyId: process.env.RAZORPAY_KEY_ID,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          status: razorpayOrder.status,
          reusedExistingOrder,
        },
        event: {
          id: String(event._id),
          name: event.name,
          registrationFee,
          registrationFeeFormatted: formatINR(registrationFee),
        },
        user: {
          name: user.name,
          email: user.email,
          contact: userPhone,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

export const verifyEventPayment = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const [event, paymentRecord] = await Promise.all([
      Event.findById(eventId),
      EventPayment.findOne({ razorpayOrderId }).sort({ createdAt: -1 }),
    ]);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!paymentRecord) {
      return res.status(404).json({ success: false, message: "Payment order not found" });
    }

    if (String(paymentRecord.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "This payment order does not belong to the current user",
      });
    }

    if (String(paymentRecord.event) !== String(event._id)) {
      return res.status(400).json({
        success: false,
        message: "Payment order does not match the selected event",
      });
    }

    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isSignatureValid) {
      paymentRecord.status = "failed";
      paymentRecord.failureReason = "Signature verification failed";
      paymentRecord.razorpayPaymentId = razorpayPaymentId;
      paymentRecord.razorpaySignature = razorpaySignature;
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const razorpayClient = getRazorpayClient();
    const razorpayPayment = await razorpayClient.payments.fetch(razorpayPaymentId);

    if (!razorpayPayment || !["captured", "authorized"].includes(razorpayPayment.status)) {
      paymentRecord.status = "failed";
      paymentRecord.failureReason = razorpayPayment?.error_description || "Payment not captured";
      paymentRecord.razorpayPaymentId = razorpayPaymentId;
      paymentRecord.razorpaySignature = razorpaySignature;
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Payment could not be verified",
      });
    }

    paymentRecord.status = "paid";
    paymentRecord.razorpayPaymentId = razorpayPaymentId;
    paymentRecord.razorpaySignature = razorpaySignature;
    paymentRecord.paymentMethod = razorpayPayment.method || "online";
    paymentRecord.paidAt = new Date();
    paymentRecord.verifiedAt = new Date();
    paymentRecord.failureReason = undefined;
    await paymentRecord.save();

    const io = req.app.get("io");
    const result = await finalizePaidRegistration({
      event,
      user: req.user,
      paymentRecord,
      io,
      actorDisplayName: req.user.name,
      shouldAwardPoints: true,
    });

    if (!result.joined && result.reason === "event_full") {
      paymentRecord.failureReason = "Event reached full capacity before participant confirmation";
      await paymentRecord.save();

      return res.status(409).json({
        success: false,
        message: "Payment received but event is now full. Contact support/admin for refund.",
      });
    }

    const updatedEvent = result.updatedEvent || (await getPopulatedEvent(event._id));

    return res.status(200).json({
      success: true,
      message: "Payment verified and event joined successfully",
      data: {
        event: updatedEvent,
        payment: {
          id: paymentRecord._id,
          status: paymentRecord.status,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          method: paymentRecord.paymentMethod,
          paidAt: paymentRecord.paidAt,
          razorpayOrderId: paymentRecord.razorpayOrderId,
          razorpayPaymentId: paymentRecord.razorpayPaymentId,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

export const getEventPaymentStatus = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const [event, latestPayment] = await Promise.all([
      Event.findById(eventId).lean(),
      EventPayment.findOne({ event: eventId, user: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const registrationFee = Number(event.registrationFee) || 0;
    const isParticipant = isEventParticipant(event, userId);
    const participant = Array.isArray(event.participants)
      ? event.participants.find((p) => getParticipantUserId(p) === String(userId))
      : null;
    const hasPaidButNotJoined = !isParticipant && latestPayment?.status === "paid";

    return res.status(200).json({
      success: true,
      data: {
        eventId: String(event._id),
        registrationFee,
        registrationFeeFormatted: formatINR(registrationFee),
        requiresPayment: registrationFee > 0 && !isParticipant && !hasPaidButNotJoined,
        hasPaidButNotJoined,
        isParticipant,
        participantPayment: participant
          ? {
              paymentStatus: participant.paymentStatus,
              paymentMethod: participant.paymentMethod,
              paidAt: participant.paidAt,
            }
          : null,
        latestPayment: latestPayment
          ? {
              id: latestPayment._id,
              status: latestPayment.status,
              amount: latestPayment.amount,
              currency: latestPayment.currency,
              razorpayOrderId: latestPayment.razorpayOrderId,
              razorpayPaymentId: latestPayment.razorpayPaymentId,
              paidAt: latestPayment.paidAt,
              failureReason: latestPayment.failureReason,
              createdAt: latestPayment.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment status",
      error: error.message,
    });
  }
};

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody;

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(503).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    const isValid = verifyRazorpayWebhookSignature({
      body: rawBody,
      signature,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = req.body || {};
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      return res.status(200).json({ success: true, message: "No matching order identifier" });
    }

    const paymentRecord = await EventPayment.findOne({ razorpayOrderId }).sort({ createdAt: -1 });
    if (!paymentRecord) {
      return res.status(200).json({ success: true, message: "Order not tracked in application" });
    }

    paymentRecord.webhookEvents = paymentRecord.webhookEvents || [];
    paymentRecord.webhookEvents.unshift({
      event: eventType,
      at: new Date(),
      payload: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        status: paymentEntity?.status || orderEntity?.status,
        method: paymentEntity?.method,
        errorCode: paymentEntity?.error_code,
        errorDescription: paymentEntity?.error_description,
      },
    });

    if (paymentRecord.webhookEvents.length > 20) {
      paymentRecord.webhookEvents = paymentRecord.webhookEvents.slice(0, 20);
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      paymentRecord.status = "paid";
      paymentRecord.razorpayPaymentId = razorpayPaymentId || paymentRecord.razorpayPaymentId;
      paymentRecord.paymentMethod = paymentEntity?.method || paymentRecord.paymentMethod;
      paymentRecord.paidAt = paymentRecord.paidAt || new Date();
      paymentRecord.verifiedAt = paymentRecord.verifiedAt || new Date();
      paymentRecord.failureReason = undefined;

      const [event, user] = await Promise.all([
        Event.findById(paymentRecord.event),
        User.findById(paymentRecord.user),
      ]);

      if (event && user) {
        const io = req.app.get("io");
        const finalizeResult = await finalizePaidRegistration({
          event,
          user,
          paymentRecord,
          io,
          actorDisplayName: user.name,
          shouldAwardPoints: true,
        });

        if (!finalizeResult.joined && finalizeResult.reason === "event_full") {
          paymentRecord.failureReason = "Event full during webhook reconciliation";
          await paymentRecord.save();
        }
      }
    }

    if (eventType === "payment.failed") {
      paymentRecord.status = "failed";
      paymentRecord.razorpayPaymentId = razorpayPaymentId || paymentRecord.razorpayPaymentId;
      paymentRecord.failureReason =
        paymentEntity?.error_description || paymentEntity?.error_reason || "Payment failed";
    }

    await paymentRecord.save();

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error.message,
    });
  }
};
