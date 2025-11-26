import User from '../models/userModel.js';
import { updateUserPoints } from '../controllers/leaderboardController.js';

// Achievement definitions
export const ACHIEVEMENTS = {
    FIRST_STEPS: {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Join your first event',
        icon: '🎯',
        category: 'events',
        points: 50,
        criteria: (user) => user.stats.eventsParticipated >= 1
    },
    EVENT_CREATOR: {
        id: 'event_creator',
        title: 'Event Creator',
        description: 'Create 5 events',
        icon: '🎪',
        category: 'events',
        points: 100,
        criteria: (user) => user.stats.eventsCreated >= 5
    },
    SOCIAL_BUTTERFLY: {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Join 10 communities',
        icon: '🦋',
        category: 'community',
        points: 75,
        criteria: (user) => user.stats.communitiesJoined >= 10
    },
    ACTIVE_PARTICIPANT: {
        id: 'active_participant',
        title: 'Active Participant',
        description: 'Participate in 25 events',
        icon: '⭐',
        category: 'events',
        points: 200,
        criteria: (user) => user.stats.eventsParticipated >= 25
    },
    CONTENT_CREATOR: {
        id: 'content_creator',
        title: 'Content Creator',
        description: 'Create 50 posts',
        icon: '✍️',
        category: 'community',
        points: 150,
        criteria: (user) => user.stats.postsCreated >= 50
    },
    REVIEWER: {
        id: 'reviewer',
        title: 'Reviewer',
        description: 'Rate 20 venues or events',
        icon: '⭐',
        category: 'engagement',
        points: 100,
        criteria: (user) => {
            // Count ratings from activity log
            const ratingActions = user.activityLog.filter(
                log => log.action === 'venue_review' || log.action === 'event_review'
            );
            return ratingActions.length >= 20;
        }
    }
};

// Point values for different actions
export const POINT_VALUES = {
    EVENT_CREATE: 50,
    EVENT_JOIN: 20,
    EVENT_COMPLETE: 30,
    EVENT_RATE: 10,
    COMMUNITY_JOIN: 15,
    POST_CREATE: 25,
    POST_LIKE: 2,
    POST_COMMENT: 10,
    VENUE_RATE: 15,
    VENUE_BOOK: 10
};

/**
 * Update user stats atomically
 * @param {String} userId - User ID
 * @param {Object} updates - Stats to update (e.g., { eventsCreated: 1, totalPoints: 50 })
 */
export const updateUserStats = async (userId, updates) => {
    try {
        const updateQuery = {};

        for (const [key, value] of Object.entries(updates)) {
            updateQuery[`stats.${key}`] = value;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: updateQuery },
            { new: true }
        );

        return user;
    } catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }
};

/**
 * Add activity log entry
 * @param {String} userId - User ID
 * @param {String} action - Action type
 * @param {Number} points - Points earned
 * @param {String} category - Category of action
 * @param {String} relatedId - Related document ID
 */
export const logUserActivity = async (userId, action, points, category, relatedId = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const activityEntry = {
            action,
            points,
            category,
            relatedId,
            timestamp: new Date()
        };

        // Limit activity log to last 100 entries
        if (user.activityLog.length >= 100) {
            user.activityLog = user.activityLog.slice(0, 99);
        }

        user.activityLog.unshift(activityEntry);
        await user.save();

        return activityEntry;
    } catch (error) {
        console.error('Error logging user activity:', error);
        throw error;
    }
};

/**
 * Award points to user and update leaderboard
 * @param {String} userId - User ID
 * @param {Number} points - Points to award
 * @param {String} category - Category for leaderboard
 * @param {String} action - Action that earned points
 * @param {String} relatedId - Related document ID
 */
export const awardPoints = async (userId, points, category, action, relatedId = null) => {
    try {
        // Update user's total points
        await updateUserStats(userId, { totalPoints: points });

        // Log the activity
        await logUserActivity(userId, action, points, category, relatedId);

        // Update leaderboard (if category is sport-related)
        if (category && category !== 'overall') {
            try {
                await updateUserPoints(userId, category, points, action);
            } catch (leaderboardError) {
                console.error('Error updating leaderboard:', leaderboardError);
                // Don't throw - leaderboard update is not critical
            }
        }

        return { success: true, points };
    } catch (error) {
        console.error('Error awarding points:', error);
        throw error;
    }
};

/**
 * Check and award achievements
 * @param {String} userId - User ID
 * @returns {Array} Newly earned achievements
 */
export const checkAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const newAchievements = [];
        const earnedAchievementIds = user.achievements.map(a => a.title);

        // Check each achievement
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            // Skip if already earned
            if (earnedAchievementIds.includes(achievement.title)) {
                continue;
            }

            // Check if criteria is met
            if (achievement.criteria(user)) {
                const newAchievement = {
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    category: achievement.category,
                    earnedAt: new Date(),
                    points: achievement.points
                };

                user.achievements.push(newAchievement);
                user.stats.achievementsCount += 1;
                user.stats.totalPoints += achievement.points;

                // Log achievement activity
                await logUserActivity(
                    userId,
                    'achievement_earned',
                    achievement.points,
                    achievement.category,
                    null
                );

                // Add notification
                await user.addNotification({
                    type: 'system',
                    title: '🏆 Achievement Unlocked!',
                    message: `You've earned the "${achievement.title}" achievement! +${achievement.points} points`,
                    achievementData: {
                        title: achievement.title,
                        icon: achievement.icon,
                        points: achievement.points
                    },
                    priority: 'high',
                    timestamp: new Date()
                });

                newAchievements.push(newAchievement);
            }
        }

        if (newAchievements.length > 0) {
            await user.save();
        }

        return newAchievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        throw error;
    }
};

/**
 * Complete action with full stats update
 * @param {String} userId - User ID
 * @param {Object} options - Action options
 * @param {String} options.action - Action type
 * @param {Number} options.points - Points to award
 * @param {String} options.category - Category
 * @param {Object} options.statUpdates - Stats to update
 * @param {String} options.relatedId - Related document ID
 * @param {Boolean} options.checkAchievements - Whether to check achievements
 */
export const completeUserAction = async (userId, options) => {
    const {
        action,
        points,
        category,
        statUpdates = {},
        relatedId = null,
        checkAchievements: shouldCheckAchievements = true
    } = options;

    try {
        // Update stats
        if (Object.keys(statUpdates).length > 0) {
            await updateUserStats(userId, statUpdates);
        }

        // Award points
        if (points > 0) {
            await awardPoints(userId, points, category, action, relatedId);
        }

        // Check for new achievements
        let newAchievements = [];
        if (shouldCheckAchievements) {
            newAchievements = await checkAchievements(userId);
        }

        return {
            success: true,
            pointsEarned: points,
            newAchievements
        };
    } catch (error) {
        console.error('Error completing user action:', error);
        throw error;
    }
};

export default {
    updateUserStats,
    logUserActivity,
    awardPoints,
    checkAchievements,
    completeUserAction,
    ACHIEVEMENTS,
    POINT_VALUES
};
