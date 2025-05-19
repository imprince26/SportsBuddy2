import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import { cloudinary } from "../config/cloudinary.js"; // Import Cloudinary
import mongoose from "mongoose";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      time,
      location,
      maxParticipants,
      category,
    } = req.body;

    const images =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
        caption: "", // Add caption if provided in req.body
      })) || [];

    const event = new Event({
      name,
      description,
      date,
      time,
      location: typeof location === "string" ? JSON.parse(location) : location,
      maxParticipants,
      category,
      images,
      createdBy: req.user._id,
      participants: [{ user: req.user._id, role: "organizer" }],
    });

    const savedEvent = await event.save();
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar");

    // Notify followers or nearby users about the new event
    const io = req.app.get("io");
    io.emit("newEvent", populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is authorized to update
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = { ...req.body };
    if (typeof updates.location === "string") {
      updates.location = JSON.parse(updates.location);
    }

    if (req.files?.length > 0) {
      // Optionally delete old images from Cloudinary
      if (event.images.length > 0) {
        for (const image of event.images) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
      updates.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        caption: "", // Add caption if provided
      }));
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    })
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar");

    // Notify participants about the update
    const io = req.app.get("io");
    event.participants.forEach((participant) => {
      io.to(`user:${participant.user}`).emit("eventUpdated", updatedEvent);
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete images from Cloudinary
    if (event.images.length > 0) {
      for (const image of event.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Notify participants about the deletion
    const io = req.app.get("io");
    event.participants.forEach((participant) => {
      io.to(`user:${participant.user}`).emit("eventDeleted", event._id);
    });

    await Event.findByIdAndDelete(req.params.id);

    // Remove event from users' lists
    await User.updateMany(
      {
        $or: [{ createdEvents: event._id }, { participatedEvents: event._id }],
      },
      {
        $pull: {
          createdEvents: event._id,
          participatedEvents: event._id,
        },
      }
    );

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting event",
      error: error.message,
    });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      location,
      radius,
      startDate,
      endDate,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== "ALL") {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Location filter with radius (in kilometers)
    if (location && radius) {
      const [lng, lat] = location.split(",").map(Number);
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000, // Convert to meters
        },
      };
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort options
    const sortOptions = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name username")
      .populate("participants.user", "name username");

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// Get Event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.members", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("ratings.user", "name avatar")
      .populate("chat.user", "name avatar");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// Join Event
export const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.isFull()) {
      return res.status(400).json({ message: "Event is full" });
    }

    if (event.isParticipant(req.user._id)) {
      return res.status(400).json({ message: "Already participating" });
    }

    event.participants.push({
      user: req.user._id,
      status: "confirmed",
    });

    await event.save();

    // Add event to user's participated events
    await User.findByIdAndUpdate(req.user._id, {
      $push: { participatedEvents: event._id },
    });

    // Notify event creator
    await User.findByIdAndUpdate(event.createdBy, {
      $push: {
        notifications: {
          type: "event",
          message: `${req.user.name} has joined your event: ${event.name}`,
        },
      },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar");

    // Notify event creator
    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("userJoinedEvent", {
      event: updatedEvent,
      user: req.user,
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({
      message: "Error joining event",
      error: error.message,
    });
  }
};

// Leave Event
export const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.isParticipant(req.user._id)) {
      return res.status(400).json({ message: "Not participating in event" });
    }

    event.participants = event.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    await event.save();

    // Remove event from user's participated events
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { participatedEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar");

    // Notify event creator
    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("userLeftEvent", {
      event: updatedEvent,
      user: req.user,
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({
      message: "Error leaving event",
      error: error.message,
    });
  }
};

// Add Team
export const addTeam = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      !event.participants.some(
        (p) => p.user.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ message: "Must be a participant to create team" });
    }

    const team = {
      name: req.body.name,
      captain: req.user._id,
      members: [req.user._id],
    };

    event.teams.push(team);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar");

    // Notify participants about new team
    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("teamCreated", {
      event: updatedEvent,
      team: updatedEvent.teams[updatedEvent.teams.length - 1],
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({
      message: "Error adding team",
      error: error.message,
    });
  }
};

// Add Rating
export const addRating = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.isParticipant(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only participants can rate events" });
    }

    const existingRating = event.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).json({ message: "Already rated this event" });
    }

    event.ratings.push({
      user: req.user._id,
      rating: req.body.rating,
      review: req.body.review,
    });

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar")
      .populate("ratings.user", "name avatar");

    // Notify event creator about new rating
    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("newRating", {
      event: updatedEvent,
      rating: updatedEvent.ratings[updatedEvent.ratings.length - 1],
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({
      message: "Error adding rating",
      error: error.message,
    });
  }
};

// Send Chat Message
export const sendMessage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      !event.isParticipant(req.user._id) &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only participants and creator can send messages",
      });
    }

    event.chat.push({
      user: req.user._id,
      message: req.body.message,
    });

    await event.save();

    // Populate the new message with user details
    const populatedEvent = await Event.findById(event._id).populate(
      "chat.user",
      "name avatar"
    );

    // Broadcast message to event participants
    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit(
      "newMessage",
      populatedEvent.chat[populatedEvent.chat.length - 1]
    );

    res.json(populatedEvent.chat[populatedEvent.chat.length - 1]);
  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Get User Events
export const getUserEvents = async (req, res) => {

  try {
    const userId = req.params.userId;
    const events = await Event.find({
      "createdBy": userId,
    })
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar")
      .populate("ratings.user", "name avatar")
      .populate("chat.user", "name avatar");

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user events",
      error: error,
    });
  }
};

// Search events
export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const events = await Event.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } }
      ]
    })
      .populate("createdBy", "name username avatar")
      .populate("participants.user", "name username avatar")
      .limit(20);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching events",
      error: error.message
    });
  }
};

export const getNearbyEvents = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const events = await Event.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert to meters
        }
      }
    })
      .populate("createdBy", "name username avatar")
      .populate("participants.user", "name username avatar")
      .limit(20);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching nearby events",
      error: error.message
    });
  }
};
