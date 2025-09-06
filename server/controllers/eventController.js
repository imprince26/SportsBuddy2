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

    // Handle image uploads - files are already uploaded to Cloudinary by multer
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => ({
        url: file.path, // Cloudinary URL from multer
        public_id: file.filename, // Cloudinary public_id from multer
        width: file.width || 800,
        height: file.height || 600,
        format: file.format || 'jpg'
      }));
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
    // Clean up uploaded images if event creation fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await deleteImage(file.filename).catch((err) => 
          console.error("Failed to cleanup image:", err)
        );
      }
    }

    res.status(400).json({
      success: false,
      message: "Failed to create event",
      error: error.message
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      status,
      dateRange,
      feeType, // Added feeType filter
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
        { "location.address": { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } }
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

    // Fee type filter
    if (feeType && feeType !== "all") {
      if (feeType === "free") {
        query.$or = [
          { registrationFee: { $exists: false } },
          { registrationFee: 0 },
          { registrationFee: null }
        ];
      } else if (feeType === "paid") {
        query.registrationFee = { $gt: 0 };
      }
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
          // For participant count sorting, we'll use aggregation
          break;
        case "name":
          sort.name = order === "desc" ? -1 : 1;
          break;
        case "fee":
          sort.registrationFee = order === "desc" ? -1 : 1;
          break;
        default:
          sort.date = 1; // Default sort by date ascending
      }
    }

    // Use aggregation pipeline if we need to sort by participant count
    let events, total;
    
    if (sortBy && sortBy.startsWith("participants:")) {
      const [, order] = sortBy.split(":");
      
      // Aggregation pipeline for complex sorting
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            participantCount: { $size: "$participants" },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$ratings" }, 0] },
                then: {
                  $divide: [
                    { $sum: "$ratings.rating" },
                    { $size: "$ratings" }
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $sort: {
            participantCount: order === "desc" ? -1 : 1,
            date: 1 // Secondary sort by date
          }
        },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
            pipeline: [
              { $project: { name: 1, avatar: 1, username: 1 } }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "participants.user",
            foreignField: "_id",
            as: "participantUsers",
            pipeline: [
              { $project: { name: 1, avatar: 1, username: 1 } }
            ]
          }
        },
        { $unwind: "$createdBy" }
      ];

      [events, total] = await Promise.all([
        Event.aggregate(pipeline),
        Event.countDocuments(query)
      ]);

      // Map participant users back to participants array
      events = events.map(event => {
        const participantMap = new Map(
          event.participantUsers.map(user => [user._id.toString(), user])
        );
        
        event.participants = event.participants.map(participant => ({
          ...participant,
          user: participantMap.get(participant.user.toString()) || participant.user
        }));
        
        delete event.participantUsers;
        return event;
      });

    } else {
      // Regular query for simple sorting
      [events, total] = await Promise.all([
        Event.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate("createdBy", "name avatar username")
          .populate("participants.user", "name avatar username")
          .lean(),
        Event.countDocuments(query)
      ]);
    }

    // Calculate additional metadata for each event
    const eventsWithMetadata = events.map(event => {
      const participantCount = event.participants?.length || 0;
      const averageRating = event.ratings?.length > 0 
        ? event.ratings.reduce((acc, rating) => acc + rating.rating, 0) / event.ratings.length 
        : 0;
      
      return {
        ...event,
        participantCount,
        spotsLeft: event.maxParticipants - participantCount,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        isUpcoming: new Date(event.date) > now,
        daysUntilEvent: Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24)),
        isFreeEvent: !event.registrationFee || event.registrationFee === 0,
        fillPercentage: Math.round((participantCount / event.maxParticipants) * 100),
        isAlmostFull: (participantCount / event.maxParticipants) > 0.85
      };
    });

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
        feeType: feeType || "all",
        sortBy: sortBy || "date:asc"
      },
      stats: {
        totalEvents: total,
        freeEvents: eventsWithMetadata.filter(e => e.isFreeEvent).length,
        paidEvents: eventsWithMetadata.filter(e => !e.isFreeEvent).length,
        upcomingEvents: eventsWithMetadata.filter(e => e.isUpcoming).length,
        categories: [...new Set(eventsWithMetadata.map(e => e.category))],
        avgRating: eventsWithMetadata.length > 0 
          ? Math.round((eventsWithMetadata.reduce((sum, e) => sum + (e.averageRating || 0), 0) / eventsWithMetadata.length) * 10) / 10
          : 0
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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

export const updateEvent = async (req, res) => {
  let newlyUploadedImages = [];

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    let updatedImages = [];

    // Handle existing images
    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      updatedImages = [...existingImages];
    }

    // Handle deleted images
    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      for (const publicId of deletedImages) {
        await deleteImage(publicId).catch((err) => 
          console.error("Failed to delete image:", err)
        );
      }
    }

    // Handle new image uploads - files are already uploaded to Cloudinary by multer
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const imageData = {
          url: file.path, // Cloudinary URL from multer
          public_id: file.filename, // Cloudinary public_id from multer
          width: file.width || 800,
          height: file.height || 600,
          format: file.format || 'jpg'
        };
        newlyUploadedImages.push(file.filename); // Track for cleanup if update fails
        return imageData;
      });

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

    // Clean up newly uploaded images if update fails
    for (const publicId of newlyUploadedImages) {
      await deleteImage(publicId).catch((err) => 
        console.error("Failed to cleanup uploaded image:", err)
      );
    }

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

    console.log(req.user)

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
    console.log(error.message)
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

// ...existing code...

// Get Featured Events
export const getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const now = new Date();
    
    // Define criteria for featured events
    const featuredQuery = {
      status: { $in: ["Upcoming", "Ongoing"] },
      date: { $gte: now }, // Only future events
      $or: [
        // Events with high participant count (80% or more filled)
        {
          $expr: {
            $gte: [
              { $divide: [{ $size: "$participants" }, "$maxParticipants"] },
              0.8
            ]
          }
        },
        // Events with high ratings (4.0 or above)
        {
          $expr: {
            $gte: [
              {
                $cond: {
                  if: { $gt: [{ $size: "$ratings" }, 0] },
                  then: {
                    $divide: [
                      { $sum: "$ratings.rating" },
                      { $size: "$ratings" }
                    ]
                  },
                  else: 0
                }
              },
              4.0
            ]
          }
        },
        // Recently created events (within last 7 days)
        {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        // Events with images (more engaging)
        {
          $expr: { $gt: [{ $size: "$images" }, 0] }
        },
        // Events in popular categories
        {
          category: { $in: ["Football", "Basketball", "Tennis", "Running"] }
        }
      ]
    };

    // Aggregation pipeline for featured events
    const featuredEvents = await Event.aggregate([
      { $match: featuredQuery },
      
      // Add computed fields
      {
        $addFields: {
          participantCount: { $size: "$participants" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: {
                $divide: [
                  { $sum: "$ratings.rating" },
                  { $size: "$ratings" }
                ]
              },
              else: 0
            }
          },
          fillPercentage: {
            $divide: [{ $size: "$participants" }, "$maxParticipants"]
          },
          daysUntilEvent: {
            $divide: [
              { $subtract: ["$date", now] },
              1000 * 60 * 60 * 24
            ]
          },
          hasImages: { $gt: [{ $size: "$images" }, 0] },
          recentlyCreated: {
            $gte: [
              "$createdAt",
              new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            ]
          }
        }
      },
      
      // Calculate feature score
      {
        $addFields: {
          featureScore: {
            $add: [
              // High fill percentage gets more points
              { $multiply: ["$fillPercentage", 30] },
              
              // High rating gets more points
              { $multiply: ["$averageRating", 15] },
              
              // Recent events get bonus points
              { $cond: ["$recentlyCreated", 20, 0] },
              
              // Events with images get bonus points
              { $cond: ["$hasImages", 10, 0] },
              
              // Upcoming events get more points (sooner = higher score)
              {
                $cond: {
                  if: { $lte: ["$daysUntilEvent", 7] },
                  then: { $subtract: [15, "$daysUntilEvent"] },
                  else: 5
                }
              },
              
              // Popular categories get bonus points
              {
                $cond: {
                  if: { 
                    $in: ["$category", ["Football", "Basketball", "Tennis", "Running"]] 
                  },
                  then: 10,
                  else: 5
                }
              }
            ]
          }
        }
      },
      
      // Sort by feature score
      { $sort: { featureScore: -1, createdAt: -1 } },
      
      // Limit results
      { $limit: parseInt(limit) },
      
      // Populate references
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            { $project: { name: 1, avatar: 1, username: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "participants.user",
          foreignField: "_id",
          as: "participantUsers",
          pipeline: [
            { $project: { name: 1, avatar: 1, username: 1 } }
          ]
        }
      },
      
      // Unwind createdBy array
      { $unwind: "$createdBy" },
      
      // Add final metadata
      {
        $addFields: {
          spotsLeft: { $subtract: ["$maxParticipants", "$participantCount"] },
          isUpcoming: { $gt: ["$date", now] },
          isFeatured: true
        }
      },
      
      // Project final fields
      {
        $project: {
          featureScore: 0,
          fillPercentage: 0,
          hasImages: 0,
          recentlyCreated: 0,
          participantUsers: 0
        }
      }
    ]);

    // If we don't have enough featured events, get some recent popular events
    if (featuredEvents.length < parseInt(limit)) {
      const remaining = parseInt(limit) - featuredEvents.length;
      const featuredIds = featuredEvents.map(event => event._id);
      
      const additionalEvents = await Event.find({
        _id: { $nin: featuredIds },
        status: { $in: ["Upcoming", "Ongoing"] },
        date: { $gte: now }
      })
        .sort({ createdAt: -1, participantCount: -1 })
        .limit(remaining)
        .populate("createdBy", "name avatar username")
        .populate("participants.user", "name avatar username")
        .lean();

      // Add metadata to additional events
      const additionalWithMetadata = additionalEvents.map(event => ({
        ...event,
        participantCount: event.participants?.length || 0,
        spotsLeft: event.maxParticipants - (event.participants?.length || 0),
        averageRating: event.ratings?.length > 0 
          ? event.ratings.reduce((acc, rating) => acc + rating.rating, 0) / event.ratings.length 
          : 0,
        isUpcoming: new Date(event.date) > now,
        daysUntilEvent: Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24)),
        isFeatured: false
      }));

      featuredEvents.push(...additionalWithMetadata);
    }

    // Get some stats for the featured events
    const stats = {
      totalFeatured: featuredEvents.length,
      categories: [...new Set(featuredEvents.map(e => e.category))],
      avgRating: featuredEvents.length > 0 
        ? (featuredEvents.reduce((sum, e) => sum + (e.averageRating || 0), 0) / featuredEvents.length).toFixed(1)
        : 0,
      totalParticipants: featuredEvents.reduce((sum, e) => sum + (e.participantCount || 0), 0)
    };

    res.json({
      success: true,
      data: featuredEvents,
      stats,
      meta: {
        timestamp: now.toISOString(),
        limit: parseInt(limit),
        algorithm: "hybrid_scoring",
        criteria: [
          "High participation rate (80%+)",
          "High ratings (4.0+)",
          "Recently created",
          "Has images",
          "Popular categories",
          "Upcoming events"
        ]
      }
    });

  } catch (error) {
    console.error("Error fetching featured events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured events",
      error: error.message
    });
  }
};

export const getTrendingEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const trendingEvents = await Event.aggregate([
      {
        $match: {
          status: { $in: ["Upcoming", "Ongoing"] },
          date: { $gte: now },
          createdAt: { $gte: oneWeekAgo } // Only events from last week
        }
      },
      
      {
        $addFields: {
          participantCount: { $size: "$participants" },
          recentParticipants: {
            $size: {
              $filter: {
                input: "$participants",
                cond: { $gte: ["$$this.joinedAt", oneDayAgo] }
              }
            }
          },
          recentRatings: {
            $size: {
              $filter: {
                input: "$ratings",
                cond: { $gte: ["$$this.date", oneDayAgo] }
              }
            }
          },
          trendScore: {
            $add: [
              { $multiply: [{ $size: "$participants" }, 2] }, // Total participants
              { $multiply: [
                {
                  $size: {
                    $filter: {
                      input: "$participants",
                      cond: { $gte: ["$$this.joinedAt", oneDayAgo] }
                    }
                  }
                }, 
                10
              ]}, // Recent participants (weighted more)
              { $multiply: [
                {
                  $size: {
                    $filter: {
                      input: "$ratings",
                      cond: { $gte: ["$$this.date", oneDayAgo] }
                    }
                  }
                }, 
                5
              ]} // Recent ratings
            ]
          }
        }
      },
      
      { $match: { trendScore: { $gt: 0 } } }, // Only events with some activity
      { $sort: { trendScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      
      // Populate references
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
        }
      },
      { $unwind: "$createdBy" },
      
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: { $divide: [{ $sum: "$ratings.rating" }, { $size: "$ratings" }] },
              else: 0
            }
          },
          spotsLeft: { $subtract: ["$maxParticipants", "$participantCount"] },
          isUpcoming: { $gt: ["$date", now] },
          isTrending: true
        }
      },
      
      { $project: { trendScore: 0, recentParticipants: 0, recentRatings: 0 } }
    ]);

    res.json({
      success: true,
      data: trendingEvents,
      meta: {
        timestamp: now.toISOString(),
        limit: parseInt(limit),
        algorithm: "activity_based_trending",
        timeWindow: "24_hours"
      }
    });

  } catch (error) {
    console.error("Error fetching trending events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending events",
      error: error.message
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
