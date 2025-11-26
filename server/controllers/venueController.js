import Venue from '../models/venueModel.js';
import User from '../models/userModel.js';
import { cloudinary } from '../config/cloudinary.js';
import { extractPublicIdFromUrl } from '../config/cloudinary.js';
import { completeUserAction, POINT_VALUES } from '../utils/userStatsHelper.js';

// Get all venues with filters
export const getAllVenues = async (req, res) => {
  try {
    const {
      search,
      city,
      sport,
      capacity,
      priceRange,
      verified,
      sortBy = "createdAt:desc",
      page = 1,
      limit = 12,
      lat,
      lng,
      radius = 10
    } = req.query;

    const query = { isActive: true };

    // Allow admins to see all venues
    if (req.user && req.user.role === 'admin') {
      delete query.isActive;
    }

    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "location.city": { $regex: search.trim(), $options: "i" } },
        { "location.address": { $regex: search.trim(), $options: "i" } }
      ];
    }

    // Location filter
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    // Sport filter
    if (sport && sport !== "all") {
      query.sports = sport;
    }

    // Capacity filter
    if (capacity) {
      const [min, max] = capacity.split("-");
      query.capacity = { $gte: parseInt(min) };
      if (max && max !== "plus") {
        query.capacity.$lte = parseInt(max);
      }
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      query["pricing.hourlyRate"] = { $gte: parseInt(min) };
      if (max && max !== "plus") {
        query["pricing.hourlyRate"].$lte = parseInt(max);
      }
    }

    // Verified filter
    if (verified === "true") {
      query.isVerified = true;
    }

    // Geolocation filter
    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Sort configuration
    const [sortField, sortOrder] = sortBy.split(":");
    const sort = {};

    switch (sortField) {
      case "name":
        sort.name = sortOrder === "desc" ? -1 : 1;
        break;
      case "price":
        sort["pricing.hourlyRate"] = sortOrder === "desc" ? -1 : 1;
        break;
      case "capacity":
        sort.capacity = sortOrder === "desc" ? -1 : 1;
        break;
      case "rating":
        // Will be handled in aggregation
        break;
      default:
        sort.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let venues, total;

    if (sortField === "rating") {
      // Use aggregation for rating sort
      const pipeline = [
        { $match: query },
        {
          $addFields: {
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
        { $sort: { averageRating: sortOrder === "desc" ? -1 : 1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];

      venues = await Venue.aggregate([
        ...pipeline,
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
          }
        },
        { $unwind: "$owner" }
      ]);

      total = await Venue.countDocuments(query);
    } else {
      venues = await Venue.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "name avatar username")
        .populate("eventsHosted", "name date participantCount")
        .lean();

      total = await Venue.countDocuments(query);
    }

    // Add computed fields
    const venuesWithMetadata = venues.map(venue => ({
      ...venue,
      averageRating: venue.ratings?.length > 0
        ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
        : 0,
      totalBookings: venue.bookings?.length || 0,
      upcomingEvents: venue.eventsHosted?.filter(event =>
        new Date(event.date) > new Date()
      ).length || 0
    }));

    res.json({
      success: true,
      data: venuesWithMetadata,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching venues",
      error: error.message
    });
  }
};

// Get single venue
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate("owner", "name avatar username email")
      .populate("ratings.user", "name avatar username")
      .populate("bookings.user", "name avatar username")
      .populate("eventsHosted")
      .lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Calculate additional metrics
    const averageRating = venue.ratings.length > 0
      ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
      : 0;

    const upcomingEvents = venue.eventsHosted.filter(event =>
      new Date(event.date) > new Date()
    );

    const recentReviews = venue.ratings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        ...venue,
        averageRating,
        totalBookings: venue.bookings.length,
        upcomingEventsCount: upcomingEvents.length,
        upcomingEvents,
        recentReviews,
        totalReviews: venue.ratings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching venue",
      error: error.message
    });
  }
};

// Create venue
export const createVenue = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      sports,
      amenities,
      capacity,
      pricing,
      availability,
      contactInfo
    } = req.body;

    let uploadedImages = [];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return cloudinary.uploader.upload(file.path, {
            folder: "venues",
            transformation: [
              { width: 1200, height: 800, crop: "fill", quality: "auto" },
              { fetch_format: "auto" }
            ]
          });
        });

        uploadedImages = await Promise.all(uploadPromises);
      } catch (uploadError) {
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    const venue = new Venue({
      name,
      description,
      location: typeof location === "string" ? JSON.parse(location) : location,
      sports: Array.isArray(sports) ? sports : JSON.parse(sports || "[]"),
      amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities || "[]"),
      capacity,
      pricing: typeof pricing === "string" ? JSON.parse(pricing) : pricing,
      availability: Array.isArray(availability) ? availability : JSON.parse(availability || "[]"),
      contactInfo: typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo,
      images: uploadedImages.map(img => ({
        url: img.secure_url,
        public_id: img.public_id
      })),
      owner: req.user.id
    });

    await venue.save();

    const populatedVenue = await Venue.findById(venue._id)
      .populate("owner", "name avatar username");

    res.status(201).json({
      success: true,
      message: "Venue created successfully",
      data: populatedVenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating venue",
      error: error.message
    });
    console.log(error)
  }
};

// Rate venue
export const rateVenue = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const venueId = req.params.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Check if user already rated
    const existingRatingIndex = venue.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      venue.ratings[existingRatingIndex].rating = rating;
      venue.ratings[existingRatingIndex].review = review || '';
      venue.ratings[existingRatingIndex].date = new Date();
    } else {
      // Add new rating
      venue.ratings.push({
        user: req.user.id,
        rating: Number(rating),
        review: review || '',
        date: new Date()
      });
    }

    await venue.save();

    // Update user stats: award points for rating venue (only for new ratings)
    if (existingRatingIndex === -1) {
      try {
        await completeUserAction(req.user.id, {
          action: 'venue_review',
          points: POINT_VALUES.VENUE_RATE,
          category: 'engagement',
          statUpdates: {},
          relatedId: venueId,
          checkAchievements: true
        });
      } catch (statsError) {
        console.error('Error updating user stats:', statsError);
      }
    }

    // Fetch updated venue with all populated fields
    const updatedVenue = await Venue.findById(venueId)
      .populate("owner", "name avatar username email")
      .populate("ratings.user", "name avatar username")
      .populate("bookings.user", "name avatar username")
      .populate("eventsHosted")
      .lean();

    // Calculate metrics
    const averageRating = updatedVenue.ratings.length > 0
      ? (updatedVenue.ratings.reduce((acc, r) => acc + r.rating, 0) / updatedVenue.ratings.length).toFixed(1)
      : 0;

    const recentReviews = updatedVenue.ratings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      message: existingRatingIndex !== -1 ? "Rating updated successfully" : "Rating submitted successfully",
      data: {
        ...updatedVenue,
        averageRating,
        totalReviews: updatedVenue.ratings.length,
        recentReviews
      }
    });
  } catch (error) {
    console.error('Rate venue error:', error);
    res.status(500).json({
      success: false,
      message: "Error rating venue",
      error: error.message
    });
  }
};

// Book venue
export const bookVenue = async (req, res) => {
  try {
    const { startTime, endTime, eventId, notes } = req.body;
    const venueId = req.params.id;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Check for conflicts
    const hasConflict = venue.bookings.some(booking => {
      if (booking.status === "cancelled") return false;

      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const requestStart = new Date(startTime);
      const requestEnd = new Date(endTime);

      return (requestStart < bookingEnd && requestEnd > bookingStart);
    });

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: "Venue is not available during the requested time"
      });
    }

    // Calculate amount
    const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
    const amount = venue.pricing.hourlyRate * hours;
    const totalAmount = amount; // Can add taxes, fees, etc. here

    venue.bookings.push({
      user: req.user.id,
      event: eventId,
      startTime,
      endTime,
      amount,
      totalAmount,
      duration: hours,
      notes: notes || '',
      status: "confirmed" // In real app, might be "pending" pending payment
    });

    await venue.save();

    const booking = venue.bookings[venue.bookings.length - 1];

    res.json({
      success: true,
      message: "Venue booked successfully",
      data: {
        booking,
        venue: {
          _id: venue._id,
          name: venue.name,
          location: venue.location
        }
      }
    });
  } catch (error) {
    console.error('Book venue error:', error);
    res.status(500).json({
      success: false,
      message: "Error booking venue",
      error: error.message
    });
  }
};

// Get featured venues
export const getFeaturedVenues = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredVenues = await Venue.aggregate([
      { $match: { isActive: true, isVerified: true } },
      {
        $addFields: {
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
          totalBookings: { $size: "$bookings" },
          recentBookings: {
            $size: {
              $filter: {
                input: "$bookings",
                cond: {
                  $gte: [
                    "$$this.bookingDate",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          featuredScore: {
            $add: [
              { $multiply: ["$averageRating", 20] },
              { $multiply: ["$recentBookings", 5] },
              { $multiply: ["$totalBookings", 2] }
            ]
          }
        }
      },
      { $sort: { featuredScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
        }
      },
      { $unwind: "$owner" },
      {
        $project: {
          featuredScore: 0,
          recentBookings: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: featuredVenues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured venues",
      error: error.message
    });
  }
};

export const updateVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Check if user is owner or admin
    if (venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this venue"
      });
    }

    const {
      name,
      description,
      location,
      sports,
      amenities,
      capacity,
      pricing,
      availability,
      contactInfo,
      isActive,
      deletedImages
    } = req.body;

    // Handle deleted images
    if (deletedImages) {
      try {
        const imagesToDelete = Array.isArray(deletedImages)
          ? deletedImages
          : JSON.parse(deletedImages || '[]');

        if (imagesToDelete.length > 0) {
          // Delete images from Cloudinary and remove from database
          for (const imageUrl of imagesToDelete) {
            // Find the image in venue.images by URL
            const imageToDelete = venue.images.find(img => img.url === imageUrl);

            if (imageToDelete && imageToDelete.public_id) {
              try {
                // Delete from Cloudinary using public_id
                await cloudinary.uploader.destroy(imageToDelete.public_id);
                console.log(`Deleted image from Cloudinary: ${imageToDelete.public_id}`);
              } catch (cloudinaryError) {
                console.error(`Error deleting image from Cloudinary: ${imageToDelete.public_id}`, cloudinaryError);
                // Continue with other deletions even if one fails
              }
            } else {
              // Fallback: try to extract public_id from URL if not found in database
              const publicId = extractPublicIdFromUrl(imageUrl);
              if (publicId) {
                try {
                  await cloudinary.uploader.destroy(publicId);
                  console.log(`Deleted image from Cloudinary using extracted public_id: ${publicId}`);
                } catch (cloudinaryError) {
                  console.error(`Error deleting image from Cloudinary: ${publicId}`, cloudinaryError);
                }
              }
            }
          }

          // Remove deleted images from venue.images array
          venue.images = venue.images.filter(img => !imagesToDelete.includes(img.url));
          console.log(`Removed ${imagesToDelete.length} images from database`);
        }
      } catch (deleteError) {
        console.error('Error processing deleted images:', deleteError);
        // Don't throw error, just log it and continue with update
      }
    }

    // Handle new image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return cloudinary.uploader.upload(file.path, {
            folder: "venues",
            transformation: [
              { width: 1200, height: 800, crop: "fill", quality: "auto" },
              { fetch_format: "auto" }
            ]
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        newImages = uploadResults.map(img => ({
          url: img.secure_url,
          public_id: img.public_id
        }));
      } catch (uploadError) {
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    // Update fields
    if (name) venue.name = name;
    if (description) venue.description = description;
    if (location) venue.location = typeof location === "string" ? JSON.parse(location) : location;
    if (sports) venue.sports = Array.isArray(sports) ? sports : JSON.parse(sports);
    if (amenities) venue.amenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
    if (capacity) venue.capacity = capacity;
    if (pricing) venue.pricing = typeof pricing === "string" ? JSON.parse(pricing) : pricing;
    if (availability) venue.availability = Array.isArray(availability) ? availability : JSON.parse(availability);
    if (contactInfo) venue.contactInfo = typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo;
    if (isActive !== undefined) venue.isActive = isActive;

    // Add new images
    if (newImages.length > 0) {
      venue.images = [...venue.images, ...newImages];
    }

    venue.updatedAt = new Date();
    await venue.save();

    const updatedVenue = await Venue.findById(venueId)
      .populate("owner", "name avatar username");

    res.json({
      success: true,
      message: "Venue updated successfully",
      data: updatedVenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating venue",
      error: error.message
    });
    console.log(error)
  }
};

// Delete venue
export const deleteVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Check if user is owner or admin
    if (venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this venue"
      });
    }

    // Check for active bookings
    const activeBookings = venue.bookings.filter(
      booking => booking.status === "confirmed" && new Date(booking.endTime) > new Date()
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete venue with active bookings"
      });
    }

    // Delete images from cloudinary
    if (venue.images && venue.images.length > 0) {
      try {
        const deletePromises = venue.images.map(img =>
          cloudinary.uploader.destroy(img.public_id)
        );
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error("Error deleting images:", deleteError);
      }
    }

    await Venue.findByIdAndDelete(venueId);

    res.json({
      success: true,
      message: "Venue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting venue",
      error: error.message
    });
  }
};

// Get nearby venues
export const getNearbyVenues = async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const venues = await Venue.find({
      isActive: true,
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
      .populate("owner", "name avatar username")
      .limit(parseInt(limit))
      .lean();

    // Add distance calculation and metadata
    const venuesWithMetadata = venues.map(venue => {
      const venueCoords = venue.location.coordinates;
      const distance = calculateDistance(
        parseFloat(lat), parseFloat(lng),
        venueCoords[1], venueCoords[0]
      );

      return {
        ...venue,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        averageRating: venue.ratings?.length > 0
          ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
          : 0
      };
    });

    res.json({
      success: true,
      data: venuesWithMetadata,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: parseFloat(radius)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching nearby venues",
      error: error.message
    });
  }
};

// Search venues
export const searchVenues = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const venues = await Venue.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { sports: { $in: [new RegExp(q, 'i')] } },
        { amenities: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .populate("owner", "name avatar username")
      .limit(parseInt(limit))
      .sort({ name: 1 })
      .lean();

    // Add metadata
    const venuesWithMetadata = venues.map(venue => ({
      ...venue,
      averageRating: venue.ratings?.length > 0
        ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
        : 0,
      totalBookings: venue.bookings?.length || 0
    }));

    res.json({
      success: true,
      data: venuesWithMetadata,
      query: q,
      total: venuesWithMetadata.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching venues",
      error: error.message
    });
  }
};

// Add venue review (alias for rateVenue)
export const addVenueReview = rateVenue;

// Get venue reviews
export const getVenueReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "date:desc" } = req.query;
    const venueId = req.params.id;

    const venue = await Venue.findById(venueId)
      .populate("ratings.user", "name avatar username")
      .lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Sort reviews
    const [sortField, sortOrder] = sortBy.split(":");
    venue.ratings.sort((a, b) => {
      if (sortField === "rating") {
        return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
      } else {
        return sortOrder === "desc"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = venue.ratings.slice(skip, skip + parseInt(limit));

    // Calculate stats
    const ratingStats = {
      average: venue.ratings.length > 0
        ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
        : 0,
      total: venue.ratings.length,
      distribution: {
        5: venue.ratings.filter(r => r.rating === 5).length,
        4: venue.ratings.filter(r => r.rating === 4).length,
        3: venue.ratings.filter(r => r.rating === 3).length,
        2: venue.ratings.filter(r => r.rating === 2).length,
        1: venue.ratings.filter(r => r.rating === 1).length
      }
    };

    res.json({
      success: true,
      data: paginatedReviews,
      stats: ratingStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(venue.ratings.length / parseInt(limit)),
        total: venue.ratings.length,
        hasNext: parseInt(page) < Math.ceil(venue.ratings.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching venue reviews",
      error: error.message
    });
  }
};

// Get venue bookings
export const getVenueBookings = async (req, res) => {
  try {
    const venueId = req.params.id;
    const { status, startDate, endDate } = req.query;

    const venue = await Venue.findById(venueId)
      .populate("bookings.user", "name avatar username")
      .populate("bookings.event", "name date")
      .lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    // Check if user is owner or admin
    if (venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bookings"
      });
    }

    let bookings = venue.bookings;

    // Filter by status
    if (status && status !== "all") {
      bookings = bookings.filter(booking => booking.status === status);
    }

    // Filter by date range
    if (startDate && endDate) {
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
      });
    }

    // Sort by booking date (most recent first)
    bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    res.json({
      success: true,
      data: bookings,
      total: bookings.length,
      stats: {
        confirmed: venue.bookings.filter(b => b.status === "confirmed").length,
        pending: venue.bookings.filter(b => b.status === "pending").length,
        cancelled: venue.bookings.filter(b => b.status === "cancelled").length,
        totalRevenue: venue.bookings
          .filter(b => b.status === "confirmed")
          .reduce((sum, b) => sum + (b.amount || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching venue bookings",
      error: error.message
    });
  }
};

// Get venues by category
export const getVenuesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const query = {
      isActive: true,
      sports: { $in: [category] }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const venues = await Venue.find(query)
      .populate("owner", "name avatar username")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Venue.countDocuments(query);

    // Add metadata
    const venuesWithMetadata = venues.map(venue => ({
      ...venue,
      averageRating: venue.ratings?.length > 0
        ? (venue.ratings.reduce((acc, rating) => acc + rating.rating, 0) / venue.ratings.length).toFixed(1)
        : 0,
      totalBookings: venue.bookings?.length || 0
    }));

    res.json({
      success: true,
      data: venuesWithMetadata,
      category,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching venues by category",
      error: error.message
    });
  }
};

// Toggle venue favorite
export const toggleVenueFavorite = async (req, res) => {
  try {
    const venueId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found"
      });
    }

    const favoriteVenues = user.favoriteVenues || [];
    const isFavorite = favoriteVenues.includes(venueId);

    if (isFavorite) {
      // Remove from favorites
      await User.findByIdAndUpdate(userId, {
        $pull: { favoriteVenues: venueId }
      });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(userId, {
        $addToSet: { favoriteVenues: venueId }
      });
    }

    res.json({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      isFavorite: !isFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating favorite status",
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}