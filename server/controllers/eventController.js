import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import { cloudinary, uploadImage, deleteImage } from "../config/cloudinary.js"; // Import Cloudinary
import { validateEvent } from "../utils/validation.js";

// Create Event Controller
export const createEvent = async (req, res) => {
  try {
    console.log(req)
    console.log(req.files)
    // Validate event data
    // const validationResult = validateEvent(req.body);
    // if (!validationResult.success) {
    //   return res.status(400).json({
    //     message: "Validation failed",
    //     errors: validationResult.errors
    //   });
    // }

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
        // Upload each image to Cloudinary
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
        // If upload fails, cleanup any uploaded images
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

    // Populate event data
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar");

    // Add event to user's created events
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        createdEvents: savedEvent._id,
        participatedEvents: savedEvent._id
      }
    });

    // Notify followers
    const io = req.app.get("io");
    io.emit("newEvent", populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (error) {
    // Handle any cleanup if needed
    if (error.uploadedImages) {
      for (const image of error.uploadedImages) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    res.status(400).json({
      message: "Failed to create event",
      error: error.message
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

    // Check authorization
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    // Handle image updates
    let updatedImages = [];

    // Keep existing images that weren't deleted
    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      updatedImages = [...existingImages];
    }

    // Handle deleted images
    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      for (const publicId of deletedImages) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Handle new image uploads
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

    // Prepare update data
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

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar");

    // Notify participants about the update
    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("eventUpdated", updatedEvent);

    res.json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
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
      search,
      category,
      difficulty,
      status,
      dateRange,
      sortBy = "date:desc",
      radius = 10,
      location,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateRange) {
        case "today":
          query.date = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case "thisWeek":
          query.date = {
            $gte: today,
            $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          };
          break;
        case "thisMonth":
          query.date = {
            $gte: today,
            $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          };
          break;
      }
    }

    // Location filter with radius
    if (location) {
      const [lng, lat] = location.split(",").map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert to meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sort = {};
    const [field, order] = sortBy.split(":");
    sort[field] = order === "desc" ? -1 : 1;

    // Execute query with pagination
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "name avatar")
      .populate("participants.user", "name avatar")
      .populate({
        path: "ratings",
        populate: {
          path: "user",
          select: "name avatar"
        }
      });

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Send response
    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

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
