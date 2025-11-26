import User from "../models/userModel.js";

/**
 * Helper function to add activity log entry
 */
export const addActivityLog = async (userId, action, data = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const activityEntry = {
            action,
            points: data.points || 0,
            category: data.category || null,
            relatedId: data.relatedId || null,
            timestamp: new Date()
        };

        // Add to activity log (limit to last 100 entries)
        if (!user.activityLog) {
            user.activityLog = [];
        }

        user.activityLog.unshift(activityEntry);
        if (user.activityLog.length > 100) {
            user.activityLog = user.activityLog.slice(0, 100);
        }

        await user.save();
    } catch (error) {
        console.error("Error adding activity log:", error);
    }
};

/**
 * Helper function to update user stats
 */
export const updateUserStats = async (userId, statUpdates = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Update specified stats
        if (statUpdates.eventsCreated !== undefined) {
            user.stats.eventsCreated = (user.stats.eventsCreated || 0) + statUpdates.eventsCreated;
        }
        if (statUpdates.eventsParticipated !== undefined) {
            user.stats.eventsParticipated = (user.stats.eventsParticipated || 0) + statUpdates.eventsParticipated;
        }
        if (statUpdates.postsCreated !== undefined) {
            user.stats.postsCreated = (user.stats.postsCreated || 0) + statUpdates.postsCreated;
        }
        if (statUpdates.communitiesJoined !== undefined) {
            user.stats.communitiesJoined = (user.stats.communitiesJoined || 0) + statUpdates.communitiesJoined;
        }
        if (statUpdates.totalPoints !== undefined) {
            user.stats.totalPoints = (user.stats.totalPoints || 0) + statUpdates.totalPoints;
        }
        if (statUpdates.achievementsCount !== undefined) {
            user.stats.achievementsCount = (user.stats.achievementsCount || 0) + statUpdates.achievementsCount;
        }

        await user.save();
    } catch (error) {
        console.error("Error updating user stats:", error);
    }
};

/**
 * Helper function to add achievement
 */
export const addAchievement = async (userId, achievement) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Check if achievement already exists
        const exists = user.achievements?.some(a => a.title === achievement.title);
        if (exists) return;

        const newAchievement = {
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon || "🏆",
            category: achievement.category || "general",
            earnedAt: new Date(),
            points: achievement.points || 0
        };

        if (!user.achievements) {
            user.achievements = [];
        }

        user.achievements.push(newAchievement);
        user.stats.achievementsCount = user.achievements.length;

        // Add notification about achievement
        const notification = {
            type: "system",
            title: "🎉 Achievement Unlocked!",
            message: `You've earned: ${achievement.title}`,
            achievementData: {
                title: achievement.title,
                icon: achievement.icon || "🏆",
                points: achievement.points || 0
            },
            priority: "high",
            timestamp: new Date()
        };

        await user.addNotification(notification);
        await user.save();

        return newAchievement;
    } catch (error) {
        console.error("Error adding achievement:", error);
    }
};

/**
 * Helper function to check and award milestone achievements
 */
export const checkMilestoneAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const stats = user.stats || {};
        const achievements = [];

        // Event creation milestones
        if (stats.eventsCreated === 1) {
            achievements.push({
                title: "Event Pioneer",
                description: "Created your first event",
                icon: "🎯",
                category: "events",
                points: 10
            });
        } else if (stats.eventsCreated === 10) {
            achievements.push({
                title: "Event Organizer",
                description: "Created 10 events",
                icon: "🎪",
                category: "events",
                points: 50
            });
        } else if (stats.eventsCreated === 50) {
            achievements.push({
                title: "Event Master",
                description: "Created 50 events",
                icon: "👑",
                category: "events",
                points: 100
            });
        }

        // Event participation milestones
        if (stats.eventsParticipated === 1) {
            achievements.push({
                title: "First Step",
                description: "Joined your first event",
                icon: "✨",
                category: "participation",
                points: 10
            });
        } else if (stats.eventsParticipated === 25) {
            achievements.push({
                title: "Active Participant",
                description: "Joined 25 events",
                icon: "🌟",
                category: "participation",
                points: 50
            });
        } else if (stats.eventsParticipated === 100) {
            achievements.push({
                title: "Sports Enthusiast",
                description: "Joined 100 events",
                icon: "🏅",
                category: "participation",
                points: 150
            });
        }

        // Points milestones
        if (stats.totalPoints >= 100 && stats.totalPoints < 110) {
            achievements.push({
                title: "Century Club",
                description: "Earned 100 points",
                icon: "💯",
                category: "points",
                points: 20
            });
        } else if (stats.totalPoints >= 500 && stats.totalPoints < 520) {
            achievements.push({
                title: "Point Master",
                description: "Earned 500 points",
                icon: "💎",
                category: "points",
                points: 50
            });
        } else if (stats.totalPoints >= 1000 && stats.totalPoints < 1020) {
            achievements.push({
                title: "Legend",
                description: "Earned 1000 points",
                icon: "🏆",
                category: "points",
                points: 100
            });
        }

        // Award achievements
        for (const achievement of achievements) {
            await addAchievement(userId, achievement);
        }

    } catch (error) {
        console.error("Error checking milestone achievements:", error);
    }
};

/**
 * Helper function to add to favorite venues
 */
export const toggleFavoriteVenue = async (userId, venueId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return { success: false };

        const index = user.favoriteVenues?.indexOf(venueId);

        if (index > -1) {
            // Remove from favorites
            user.favoriteVenues.splice(index, 1);
            await user.save();
            return { success: true, action: "removed" };
        } else {
            // Add to favorites
            if (!user.favoriteVenues) {
                user.favoriteVenues = [];
            }
            user.favoriteVenues.push(venueId);
            await user.save();
            return { success: true, action: "added" };
        }
    } catch (error) {
        console.error("Error toggling favorite venue:", error);
        return { success: false, error: error.message };
    }
};
