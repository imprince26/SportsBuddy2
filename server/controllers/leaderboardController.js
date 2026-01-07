import Leaderboard from '../models/leaderboardModel.js';
import User from '../models/userModel.js';
import Event from '../models/eventModel.js';

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const {
      category = "overall",
      timeframe = "all",
      page = 1,
      limit = 50
    } = req.query;

    const query = { category };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Time-based filtering
    let dateFilter = {};
    if (timeframe === "monthly") {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      // For monthly, we'd need to adjust query based on monthly stats
    }

    const leaderboard = await Leaderboard.find(query)
      .populate({
        path: "user",
        select: "name avatar username location.city role",
        match: { role: { $ne: "admin" } }
      })
      .sort({ points: -1, eventsParticipated: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out entries where user is null (admin users filtered by populate match)
    const filteredLeaderboard = leaderboard.filter(entry => entry.user !== null);

    // Add rankings
    const leaderboardWithRanks = filteredLeaderboard.map((entry, index) => ({
      ...entry,
      rank: skip + index + 1,
      isCurrentUser: entry.user?._id.toString() === req.user?.id
    }));

    const total = await Leaderboard.countDocuments(query);

    // Get current user's position if not in current page
    let currentUserPosition = null;
    if (req.user) {
      const userEntry = await Leaderboard.findOne({
        user: req.user.id,
        category
      }).populate("user", "name avatar username");

      if (userEntry) {
        const userRank = await Leaderboard.countDocuments({
          category,
          points: { $gt: userEntry.points }
        }) + 1;

        currentUserPosition = {
          ...userEntry.toObject(),
          rank: userRank,
          isCurrentUser: true
        };
      }
    }

    res.json({
      success: true,
      data: leaderboardWithRanks,
      currentUserPosition,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      },
      stats: {
        totalParticipants: total,
        category,
        timeframe
      }
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
      // Return empty data structure on error
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const userStats = await Leaderboard.find({ user: userId })
      .populate("user", "name avatar username")
      .lean();

    if (!userStats.length) {
      // Create initial stats if none exist
      const categories = ["overall", "Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming"];

      for (const category of categories) {
        await Leaderboard.create({
          user: userId,
          category,
          points: 0
        });
      }

      return res.json({
        success: true,
        data: categories.map(category => ({
          user: { _id: userId },
          category,
          points: 0,
          rank: null,
          level: { current: 1, experience: 0, nextLevelExp: 100 }
        }))
      });
    }

    // Calculate ranks for each category
    const statsWithRanks = await Promise.all(
      userStats.map(async (stat) => {
        const rank = await Leaderboard.countDocuments({
          category: stat.category,
          points: { $gt: stat.points }
        }) + 1;

        return { ...stat, rank };
      })
    );

    res.json({
      success: true,
      data: statsWithRanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user stats",
      error: error.message
    });
  }
};

// Update user points (called from event participation)
export const updateUserPoints = async (userId, category, pointsToAdd, action) => {
  try {
    // Update category-specific stats
    let categoryStats = await Leaderboard.findOne({ user: userId, category });
    if (!categoryStats) {
      categoryStats = new Leaderboard({ user: userId, category });
    }

    categoryStats.points += pointsToAdd;

    // Update action-specific counts
    switch (action) {
      case "event_participation":
        categoryStats.eventsParticipated += 1;
        break;
      case "event_creation":
        categoryStats.eventsCreated += 1;
        break;
      case "event_win":
        categoryStats.eventsWon += 1;
        break;
    }

    // Update level
    while (categoryStats.level.experience >= categoryStats.level.nextLevelExp) {
      categoryStats.level.experience -= categoryStats.level.nextLevelExp;
      categoryStats.level.current += 1;
      categoryStats.level.nextLevelExp = Math.floor(categoryStats.level.nextLevelExp * 1.5);
    }
    categoryStats.level.experience += pointsToAdd;

    // Update streak
    const today = new Date();
    const lastActivity = categoryStats.streak.lastActivity;

    if (!lastActivity || !isSameDay(today, lastActivity)) {
      if (lastActivity && isConsecutiveDay(today, lastActivity)) {
        categoryStats.streak.current += 1;
        if (categoryStats.streak.current > categoryStats.streak.longest) {
          categoryStats.streak.longest = categoryStats.streak.current;
        }
      } else if (!lastActivity || !isConsecutiveDay(today, lastActivity)) {
        categoryStats.streak.current = 1;
      }
      categoryStats.streak.lastActivity = today;
    }

    await categoryStats.save();

    // Update overall stats
    let overallStats = await Leaderboard.findOne({ user: userId, category: "overall" });
    if (!overallStats) {
      overallStats = new Leaderboard({ user: userId, category: "overall" });
    }

    overallStats.points += pointsToAdd;
    switch (action) {
      case "event_participation":
        overallStats.eventsParticipated += 1;
        break;
      case "event_creation":
        overallStats.eventsCreated += 1;
        break;
      case "event_win":
        overallStats.eventsWon += 1;
        break;
    }

    await overallStats.save();

    return { categoryStats, overallStats };
  } catch (error) {
    console.error("Error updating user points:", error);
    throw error;
  }
};

// Helper functions
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isConsecutiveDay(today, lastActivity) {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(yesterday, lastActivity);
}

// Get achievements
export const getAchievements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const userStats = await Leaderboard.find({ user: userId })
      .populate("user", "name avatar username");

    const allAchievements = userStats.reduce((acc, stat) => {
      return [...acc, ...stat.achievements];
    }, []);

    // Sort by earned date
    allAchievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

    res.json({
      success: true,
      data: allAchievements,
      total: allAchievements.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching achievements",
      error: error.message
    });
  }
};

// Get leaderboard categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      { id: "overall", name: "Overall", icon: "🏆" },
      { id: "Football", name: "Football", icon: "⚽" },
      { id: "Basketball", name: "Basketball", icon: "🏀" },
      { id: "Tennis", name: "Tennis", icon: "🎾" },
      { id: "Cricket", name: "Cricket", icon: "🏏" },
      { id: "Badminton", name: "Badminton", icon: "🏸" },
      { id: "Running", name: "Running", icon: "🏃" },
      { id: "Cycling", name: "Cycling", icon: "🚴" },
      { id: "Swimming", name: "Swimming", icon: "🏊" },
      { id: "Volleyball", name: "Volleyball", icon: "🏐" }
    ];

    // Get participant counts for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const participantCount = await Leaderboard.countDocuments({
          category: category.id,
          points: { $gt: 0 }
        });

        return {
          ...category,
          participants: participantCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

// Get leaderboard by sport
export const getLeaderboardBySport = async (req, res) => {
  try {
    const { sport } = req.params;
    const {
      timeframe = "all",
      page = 1,
      limit = 50
    } = req.query;

    const query = { category: sport };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Time-based filtering
    let dateFilter = {};
    if (timeframe === "monthly") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      dateFilter.updatedAt = { $gte: startOfMonth };
    } else if (timeframe === "weekly") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter.updatedAt = { $gte: startOfWeek };
    }

    const combinedQuery = { ...query, ...dateFilter };

    const leaderboard = await Leaderboard.find(combinedQuery)
      .populate({
        path: "user",
        select: "name avatar username location.city sportsPreferences role",
        match: { role: { $ne: "admin" } }
      })
      .sort({ points: -1, eventsParticipated: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out entries where user is null (admin users)
    const filteredLeaderboard = leaderboard.filter(entry => entry.user !== null);

    // Add rankings
    const leaderboardWithRanks = filteredLeaderboard.map((entry, index) => ({
      ...entry,
      rank: skip + index + 1,
      isCurrentUser: entry.user?._id?.toString() === req.user?.id
    }));

    const total = await Leaderboard.countDocuments(combinedQuery);

    // Get sport-specific stats
    const sportStats = await Leaderboard.aggregate([
      { $match: { category: sport } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          averagePoints: { $avg: "$points" },
          totalEvents: { $sum: "$eventsParticipated" },
          topScore: { $max: "$points" }
        }
      }
    ]);

    res.json({
      success: true,
      data: leaderboardWithRanks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      },
      stats: {
        sport,
        timeframe,
        ...(sportStats.length > 0 ? sportStats[0] : {
          totalParticipants: 0,
          averagePoints: 0,
          totalEvents: 0,
          topScore: 0
        })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sport leaderboard",
      error: error.message
    });
  }
};

// Get user ranking
export const getUserRanking = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category = "overall" } = req.query;

    const userStats = await Leaderboard.findOne({
      user: userId,
      category
    }).populate("user", "name avatar username");

    if (!userStats) {
      return res.status(404).json({
        success: false,
        message: "User stats not found"
      });
    }

    // Calculate rank
    const rank = await Leaderboard.countDocuments({
      category,
      points: { $gt: userStats.points }
    }) + 1;

    // Get total participants in category
    const totalParticipants = await Leaderboard.countDocuments({
      category,
      points: { $gte: 0 }
    });

    // Get percentile
    const percentile = totalParticipants > 1
      ? Math.round((1 - (rank - 1) / totalParticipants) * 100)
      : 100;

    // Get nearby competitors (3 above, 3 below)
    const nearbyCompetitors = await Leaderboard.find({
      category,
      points: {
        $gte: Math.max(0, userStats.points - 500),
        $lte: userStats.points + 500
      }
    })
      .populate("user", "name avatar username")
      .sort({ points: -1 })
      .limit(7)
      .lean();

    res.json({
      success: true,
      data: {
        ...userStats.toObject(),
        rank,
        totalParticipants,
        percentile,
        nearbyCompetitors: nearbyCompetitors.map((competitor, index) => ({
          ...competitor,
          rank: rank - 3 + index
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user ranking",
      error: error.message
    });
  }
};

// Get leaderboard stats
export const getLeaderboardStats = async (req, res) => {
  try {
    const overallStats = await Leaderboard.aggregate([
      {
        $group: {
          _id: "$category",
          totalParticipants: { $sum: 1 },
          averagePoints: { $avg: "$points" },
          totalPoints: { $sum: "$points" },
          totalEvents: { $sum: "$eventsParticipated" },
          maxPoints: { $max: "$points" }
        }
      },
      { $sort: { totalParticipants: -1 } }
    ]);

    // Get top performers across all categories
    const topPerformers = await Leaderboard.find({ category: "overall" })
      .populate("user", "name avatar username")
      .sort({ points: -1 })
      .limit(5)
      .lean();

    // Get recent activity (users who gained points recently)
    const recentActivity = await Leaderboard.find({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .populate("user", "name avatar username")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Monthly stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Leaderboard.aggregate([
      {
        $match: {
          updatedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          activeUsers: { $addToSet: "$user" },
          totalPointsEarned: { $sum: "$points" },
          totalEventsParticipated: { $sum: "$eventsParticipated" }
        }
      },
      {
        $project: {
          activeUsers: { $size: "$activeUsers" },
          totalPointsEarned: 1,
          totalEventsParticipated: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryStats: overallStats,
        topPerformers: topPerformers.map((performer, index) => ({
          ...performer,
          rank: index + 1
        })),
        recentActivity,
        monthlyStats: monthlyStats.length > 0 ? monthlyStats[0] : {
          activeUsers: 0,
          totalPointsEarned: 0,
          totalEventsParticipated: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard stats",
      error: error.message
    });
  }
};

// Update user score (for admin/system use)
export const updateUserScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, category = "overall", reason } = req.body;

    if (!points || typeof points !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Valid points value is required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user stats
    let userStats = await Leaderboard.findOne({ user: userId, category });
    if (!userStats) {
      userStats = new Leaderboard({
        user: userId,
        category,
        points: 0
      });
    }

    const oldPoints = userStats.points;
    userStats.points += points;

    // Update level if points increased
    if (points > 0) {
      userStats.level.experience += points;
      while (userStats.level.experience >= userStats.level.nextLevelExp) {
        userStats.level.experience -= userStats.level.nextLevelExp;
        userStats.level.current += 1;
        userStats.level.nextLevelExp = Math.floor(userStats.level.nextLevelExp * 1.5);
      }
    }

    // Add to history
    userStats.pointsHistory.push({
      points,
      reason: reason || "Manual adjustment",
      date: new Date()
    });

    await userStats.save();

    // Also update overall if not overall category
    if (category !== "overall") {
      let overallStats = await Leaderboard.findOne({ user: userId, category: "overall" });
      if (!overallStats) {
        overallStats = new Leaderboard({
          user: userId,
          category: "overall",
          points: 0
        });
      }
      overallStats.points += points;
      await overallStats.save();
    }

    res.json({
      success: true,
      message: "User score updated successfully",
      data: {
        userId,
        category,
        oldPoints,
        newPoints: userStats.points,
        pointsAdded: points,
        currentLevel: userStats.level.current
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user score",
      error: error.message
    });
  }
};

// Get trophies/badges
export const getTrophies = async (req, res) => {
  try {
    const { userId } = req.query;

    // Define available trophies
    const availableTrophies = [
      {
        id: "first_event",
        name: "First Steps",
        description: "Participated in your first event",
        icon: "🏃",
        category: "participation",
        requirement: { eventsParticipated: 1 }
      },
      {
        id: "regular_participant",
        name: "Regular Participant",
        description: "Participated in 10 events",
        icon: "🎯",
        category: "participation",
        requirement: { eventsParticipated: 10 }
      },
      {
        id: "dedicated_athlete",
        name: "Dedicated Athlete",
        description: "Participated in 50 events",
        icon: "💪",
        category: "participation",
        requirement: { eventsParticipated: 50 }
      },
      {
        id: "event_organizer",
        name: "Event Organizer",
        description: "Created your first event",
        icon: "📅",
        category: "organization",
        requirement: { eventsCreated: 1 }
      },
      {
        id: "master_organizer",
        name: "Master Organizer",
        description: "Created 10 events",
        icon: "🎪",
        category: "organization",
        requirement: { eventsCreated: 10 }
      },
      {
        id: "point_collector",
        name: "Point Collector",
        description: "Earned 1000 points",
        icon: "💰",
        category: "points",
        requirement: { points: 1000 }
      },
      {
        id: "champion",
        name: "Champion",
        description: "Earned 5000 points",
        icon: "🏆",
        category: "points",
        requirement: { points: 5000 }
      },
      {
        id: "streak_master",
        name: "Streak Master",
        description: "Maintained a 7-day activity streak",
        icon: "🔥",
        category: "consistency",
        requirement: { streak: 7 }
      }
    ];

    if (userId) {
      // Get user's stats
      const userStats = await Leaderboard.find({ user: userId });

      // Check which trophies the user has earned
      const earnedTrophies = [];
      const availableToEarn = [];

      availableTrophies.forEach(trophy => {
        let hasEarned = false;

        userStats.forEach(stat => {
          const meetsRequirement = Object.entries(trophy.requirement).every(([key, value]) => {
            if (key === 'streak') {
              return stat.streak.longest >= value;
            }
            return stat[key] >= value;
          });

          if (meetsRequirement) {
            hasEarned = true;
          }
        });

        if (hasEarned) {
          earnedTrophies.push({
            ...trophy,
            earnedAt: new Date() // You might want to store actual earned dates
          });
        } else {
          availableToEarn.push(trophy);
        }
      });

      res.json({
        success: true,
        data: {
          earned: earnedTrophies,
          available: availableToEarn,
          stats: {
            totalEarned: earnedTrophies.length,
            totalAvailable: availableTrophies.length,
            completionPercentage: Math.round((earnedTrophies.length / availableTrophies.length) * 100)
          }
        }
      });
    } else {
      // Return all available trophies
      res.json({
        success: true,
        data: availableTrophies,
        categories: ["participation", "organization", "points", "consistency"]
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trophies",
      error: error.message
    });
  }
};

// Get monthly leaderboard
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { category = "overall", month, year } = req.query;

    // Default to current month if not specified
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Calculate date range for the month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Get events from that month
    const monthlyEvents = await Event.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: "completed"
    }).select("participants createdBy category");

    // Calculate monthly points for each user
    const userPoints = {};

    monthlyEvents.forEach(event => {
      // Points for participation
      event.participants.forEach(participant => {
        const userId = participant.user.toString();
        if (!userPoints[userId]) userPoints[userId] = 0;
        userPoints[userId] += 10; // Base participation points
      });

      // Points for organizing
      const organizerId = event.createdBy.toString();
      if (!userPoints[organizerId]) userPoints[organizerId] = 0;
      userPoints[organizerId] += 20; // Organizing points
    });

    // Convert to array and sort
    const leaderboard = await Promise.all(
      Object.entries(userPoints).map(async ([userId, points]) => {
        const user = await User.findById(userId).select("name avatar username");
        return {
          user,
          points,
          monthlyEvents: monthlyEvents.filter(e =>
            e.participants.some(p => p.user.toString() === userId) ||
            e.createdBy.toString() === userId
          ).length
        };
      })
    );

    // Sort by points and add rankings
    leaderboard.sort((a, b) => b.points - a.points);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: rankedLeaderboard,
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })
      },
      stats: {
        totalParticipants: leaderboard.length,
        totalEvents: monthlyEvents.length,
        averagePoints: leaderboard.length > 0
          ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.points, 0) / leaderboard.length)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching monthly leaderboard",
      error: error.message
    });
  }
};