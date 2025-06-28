import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import { cloudinary, uploadImage, deleteImage } from "../config/cloudinary.js";
import { validateEvent } from "../utils/validation.js";

// Create Event Controller
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
      difficulty,
      eventType,
      registrationFee,
      rules,
      equipment
    } = req.body;

    // Handle image uploads
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "SportsBuddy/events",
            resource_type: "auto",
            allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          });

          return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          };
        });

        uploadedImages = await Promise.all(uploadPromises);
      } catch (uploadError) {
        for (const image of uploadedImages) {
          if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        }
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    // Create new event
    const event = new Event({
      name,
      description,
      date,
      time,
      location: typeof location === "string" ? JSON.parse(location) : location,
      maxParticipants,
      category,
      difficulty,
      eventType,
      registrationFee: Number(registrationFee) || 0,
      rules: Array.isArray(rules) ? rules : [],
      equipment: Array.isArray(equipment) ? equipment : [],
      images: uploadedImages,
      createdBy: req.user._id,
      participants: [{ user: req.user._id, role: "organizer", joinedAt: new Date() }]
    });

    const savedEvent = await event.save();

    const populatedEvent = await Event.findById(savedEvent._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar");

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        createdEvents: savedEvent._id,
        participatedEvents: savedEvent._id
      }
    });

    const io = req.app.get("io");
    io.emit("newEvent", populatedEvent);

    res.status(201).json({
      success: true,
      data: populatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create event",
      error: error.message
    });
  }
};

// Get All Events with improved filtering and pagination
export const getAllEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      status,
      dateRange,
      sortBy = "date:asc",
      radius = 10,
      location,
      page = 1,
      limit = 12,
      lat,
      lng
    } = req.query;

    // Build query object
    const query = {};
    const now = new Date();

    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "location.city": { $regex: search.trim(), $options: "i" } },
        { "location.address": { $regex: search.trim(), $options: "i" } }
      ];
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty;
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    } else {
      // Default to show only upcoming and ongoing events
      query.status = { $in: ["Upcoming", "Ongoing"] };
    }

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateRange) {
        case "today":
          query.date = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case "tomorrow":
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          query.date = {
            $gte: tomorrow,
            $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case "thisWeek":
          const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          query.date = {
            $gte: today,
            $lt: endOfWeek
          };
          break;
        case "thisMonth":
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          query.date = {
            $gte: today,
            $lt: endOfMonth
          };
          break;
        case "upcoming":
          query.date = { $gte: today };
          break;
      }
    }

    // Location-based filtering
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 events per page
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sort = {};
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      switch (field) {
        case "date":
          sort.date = order === "desc" ? -1 : 1;
          break;
        case "created":
          sort.createdAt = order === "desc" ? -1 : 1;
          break;
        case "participants":
          sort["participants.length"] = order === "desc" ? -1 : 1;
          break;
        case "name":
          sort.name = order === "desc" ? -1 : 1;
          break;
        default:
          sort.date = 1; // Default sort by date ascending
      }
    }

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "name avatar username")
        .populate("participants.user", "name avatar username")
        .lean(),
      Event.countDocuments(query)
    ]);

    // Calculate additional metadata for each event
    const eventsWithMetadata = events.map(event => ({
      ...event,
      participantCount: event.participants?.length || 0,
      spotsLeft: event.maxParticipants - (event.participants?.length || 0),
      averageRating: event.ratings?.length > 0 
        ? event.ratings.reduce((acc, rating) => acc + rating.rating, 0) / event.ratings.length 
        : 0,
      isUpcoming: new Date(event.date) > now,
      daysUntilEvent: Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24))
    }));

    // Response with pagination info
    const response = {
      success: true,
      data: eventsWithMetadata,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        page: pageNum,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      filters: {
        search: search || "",
        category: category || "all",
        difficulty: difficulty || "all",
        status: status || "all",
        dateRange: dateRange || "all",
        sortBy: sortBy || "date:asc"
      }
    };

    // Set cache headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json(response);

  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
};

// Get Event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name avatar username email")
      .populate("participants.user", "name avatar username")
      .populate("teams.members", "name avatar username")
      .populate("teams.captain", "name avatar username")
      .populate("ratings.user", "name avatar username")
      .populate("chat.user", "name avatar username");

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    // Add metadata
    const now = new Date();
    const eventWithMetadata = {
      ...event.toObject(),
      participantCount: event.participants?.length || 0,
      spotsLeft: event.maxParticipants - (event.participants?.length || 0),
      averageRating: event.ratings?.length > 0 
        ? event.ratings.reduce((acc, rating) => acc + rating.rating, 0) / event.ratings.length 
        : 0,
      isUpcoming: new Date(event.date) > now,
      daysUntilEvent: Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24))
    };

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: eventWithMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// Update Event Controller
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    let updatedImages = [];

    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      updatedImages = [...existingImages];
    }

    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      for (const publicId of deletedImages) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "SportsBuddy/events",
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "jpeg", "webp"],
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        });

        return {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        };
      });

      const newImages = await Promise.all(uploadPromises);
      updatedImages = [...updatedImages, ...newImages];
    }

    const updates = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: typeof req.body.location === "string" ? JSON.parse(req.body.location) : req.body.location,
      maxParticipants: parseInt(req.body.maxParticipants),
      difficulty: req.body.difficulty,
      eventType: req.body.eventType,
      registrationFee: parseFloat(req.body.registrationFee) || 0,
      rules: req.body.rules ? JSON.parse(req.body.rules) : [],
      equipment: req.body.equipment ? JSON.parse(req.body.equipment) : [],
      images: updatedImages,
      updatedAt: new Date()
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar");

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("eventUpdated", updatedEvent);

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update event",
      error: error.message
    });
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

    if (event.images.length > 0) {
      for (const image of event.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    const io = req.app.get("io");
    event.participants.forEach((participant) => {
      io.to(`user:${participant.user}`).emit("eventDeleted", event._id);
    });

    await Event.findByIdAndDelete(req.params.id);

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
      success: false,
      message: "Error deleting event",
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

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    const isAlreadyParticipant = event.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ message: "Already participating" });
    }

    event.participants.push({
      user: req.user._id,
      status: "confirmed",
      joinedAt: new Date()
    });

    await event.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { participatedEvents: event._id },
    });

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

    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("userJoinedEvent", {
      event: updatedEvent,
      user: req.user,
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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

    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: "Not participating in event" });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { participatedEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar");

    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("userLeftEvent", {
      event: updatedEvent,
      user: req.user,
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("teamCreated", {
      event: updatedEvent,
      team: updatedEvent.teams[updatedEvent.teams.length - 1],
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding team",
      error: error.message,
    });
  }
};

export const addRating = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isParticipant = event.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
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
      date: new Date()
    });

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate("teams.captain", "name avatar")
      .populate("teams.members", "name avatar")
      .populate("ratings.user", "name avatar");

    const io = req.app.get("io");
    io.to(`user:${event.createdBy}`).emit("newRating", {
      event: updatedEvent,
      rating: updatedEvent.ratings[updatedEvent.ratings.length - 1],
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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

    const isParticipantOrCreator = event.participants.some(
      p => p.user.toString() === req.user._id.toString()
    ) || event.createdBy.toString() === req.user._id.toString();

    if (!isParticipantOrCreator) {
      return res.status(403).json({
        message: "Only participants and creator can send messages",
      });
    }

    event.chat.push({
      user: req.user._id,
      message: req.body.message,
      timestamp: new Date()
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id).populate(
      "chat.user",
      "name avatar"
    );

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit(
      "newMessage",
      populatedEvent.chat[populatedEvent.chat.length - 1]
    );

    res.json({
      success: true,
      data: populatedEvent.chat[populatedEvent.chat.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user events",
      error: error.message,
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
          $maxDistance: parseFloat(radius) * 1000
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
