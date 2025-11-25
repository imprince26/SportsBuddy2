import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Venue from "../models/venueModel.js";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("participatedEvents")
      .populate("createdEvents");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user.getProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message
    });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Get events created by user
    const createdEvents = await Event.find({ createdBy: userId })
      .populate('participants.user', 'name username avatar')
      .populate('createdBy', 'name username avatar')
      .sort({ createdAt: -1 });

    // Get events user is participating in
    const participatingEvents = await Event.find({
      'participants.user': userId,
      createdBy: { $ne: userId } // Exclude events created by user to avoid duplicates
    })
      .populate('participants.user', 'name username avatar')
      .populate('createdBy', 'name username avatar')
      .sort({ createdAt: -1 });

    // Combine all events
    const allUserEvents = [...createdEvents, ...participatingEvents];

    // Remove duplicates based on event ID
    const uniqueEvents = allUserEvents.filter((event, index, self) =>
      index === self.findIndex(e => e._id.toString() === event._id.toString())
    );

    // Sort by date
    uniqueEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: uniqueEvents,
      count: uniqueEvents.length,
      breakdown: {
        created: createdEvents.length,
        participating: participatingEvents.length,
        total: uniqueEvents.length
      }
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching user events"
    });
  }
};

// Get user followers
export const getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "name username avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
      error: error.message
    });
  }
};

// Get user following
export const getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "name username avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user.following
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching following",
      error: error.message
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } }
      ]
    })
      .select("name username avatar bio")
      .limit(20);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { emailNotifications, pushNotifications, radius } = req.body;

    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }

    if (pushNotifications !== undefined) {
      user.preferences.pushNotifications = pushNotifications;
    }

    if (radius !== undefined) {
      user.preferences.radius = radius;
    }

    await user.save();

    res.json({
      success: true,
      message: "Preferences updated successfully",
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating preferences",
      error: error.message
    });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Find all venues that have bookings from this user
    const venues = await Venue.find({
      'bookings.user': userId
    })
      .populate('bookings.user', 'name email phone avatar')
      .populate('bookings.event', 'name date')
      .lean();

    // Extract user's bookings from all venues
    let userBookings = [];
    venues.forEach(venue => {
      if (venue.bookings && venue.bookings.length > 0) {
        venue.bookings.forEach(booking => {
          const bookingUserId = typeof booking.user === 'object' ? booking.user._id : booking.user;
          if (bookingUserId?.toString() === userId.toString()) {
            userBookings.push({
              ...booking,
              venue: {
                _id: venue._id,
                name: venue.name,
                location: venue.location,
                contactInfo: venue.contactInfo,
                images: venue.images || []
              }
            });
          }
        });
      }
    });

    // Filter by status if provided
    if (status && status !== 'all') {
      userBookings = userBookings.filter(booking => booking.status === status);
    }

    // Sort by start time (most recent first)
    userBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    res.json({
      success: true,
      data: userBookings,
      count: userBookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings'
    });
  }
};

export const userStats = async (req, res) => {  
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .select("-password")
      .populate("participatedEvents")
      .populate("createdEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        eventsParticipated: user.participatedEvents.length,
        eventsCreated: user.createdEvents.length,
        followers: user.followers.length,
        following: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user stats",
      error: error.message
    });
  }
}