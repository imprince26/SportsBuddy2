import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';

const TTL = getCacheTTL('leaderboard');

/**
 * Cache overall leaderboard
 */
export const cacheOverallLeaderboard = async (data, page = 1) => {
    const key = CacheKeys.LEADERBOARD.OVERALL(page);
    await setCache(key, data, TTL);
};

/**
 * Get overall leaderboard from cache
 */
export const getOverallLeaderboardFromCache = async (page = 1) => {
    const key = CacheKeys.LEADERBOARD.OVERALL(page);
    return await getCache(key);
};

/**
 * Cache sport-specific leaderboard
 */
export const cacheSportLeaderboard = async (sport, data, page = 1) => {
    const key = CacheKeys.LEADERBOARD.SPORT(sport, page);
    await setCache(key, data, TTL);
};

/**
 * Get sport leaderboard from cache
 */
export const getSportLeaderboardFromCache = async (sport, page = 1) => {
    const key = CacheKeys.LEADERBOARD.SPORT(sport, page);
    return await getCache(key);
};

/**
 * Cache monthly leaderboard
 */
export const cacheMonthlyLeaderboard = async (data, page = 1) => {
    const key = CacheKeys.LEADERBOARD.MONTHLY(page);
    await setCache(key, data, TTL * 2);
};

/**
 * Get monthly leaderboard from cache
 */
export const getMonthlyLeaderboardFromCache = async (page = 1) => {
    const key = CacheKeys.LEADERBOARD.MONTHLY(page);
    return await getCache(key);
};

/**
 * Cache user ranking
 */
export const cacheUserRanking = async (userId, category, data) => {
    const key = CacheKeys.LEADERBOARD.USER_RANKING(userId, category);
    await setCache(key, data, TTL / 2); // Shorter TTL for user rankings
};

/**
 * Get user ranking from cache
 */
export const getUserRankingFromCache = async (userId, category = 'overall') => {
    const key = CacheKeys.LEADERBOARD.USER_RANKING(userId, category);
    return await getCache(key);
};

/**
 * Cache leaderboard stats
 */
export const cacheLeaderboardStats = async (data) => {
    const key = CacheKeys.LEADERBOARD.STATS();
    await setCache(key, data, TTL * 2);
};

/**
 * Get leaderboard stats from cache
 */
export const getLeaderboardStatsFromCache = async () => {
    const key = CacheKeys.LEADERBOARD.STATS();
    return await getCache(key);
};

/**
 * Cache user achievements
 */
export const cacheUserAchievements = async (userId, data) => {
    const key = CacheKeys.LEADERBOARD.ACHIEVEMENTS(userId);
    await setCache(key, data, TTL * 4); // Longer TTL for achievements
};

/**
 * Get user achievements from cache
 */
export const getUserAchievementsFromCache = async (userId) => {
    const key = CacheKeys.LEADERBOARD.ACHIEVEMENTS(userId);
    return await getCache(key);
};

/**
 * Cache trophies list
 */
export const cacheTrophies = async (data) => {
    const key = CacheKeys.LEADERBOARD.TROPHIES();
    await setCache(key, data, TTL * 4);
};

/**
 * Get trophies from cache
 */
export const getTrophiesFromCache = async () => {
    const key = CacheKeys.LEADERBOARD.TROPHIES();
    return await getCache(key);
};

/**
 * Cache user stats
 */
export const cacheUserStats = async (userId, data) => {
    const key = CacheKeys.LEADERBOARD.USER_STATS(userId);
    await setCache(key, data, TTL);
};

/**
 * Get user stats from cache
 */
export const getUserStatsFromCache = async (userId) => {
    const key = CacheKeys.LEADERBOARD.USER_STATS(userId);
    return await getCache(key);
};

/**
 * Cache categories list
 */
export const cacheCategories = async (data) => {
    const key = CacheKeys.LEADERBOARD.CATEGORIES();
    await setCache(key, data, TTL * 4);
};

/**
 * Get categories from cache
 */
export const getCategoriesFromCache = async () => {
    const key = CacheKeys.LEADERBOARD.CATEGORIES();
    return await getCache(key);
};

/**
 * Invalidate leaderboard by category
 */
export const invalidateLeaderboard = async (category = 'overall') => {
    if (category === 'overall') {
        const pattern = 'leaderboard:overall:*';
        await deleteCachePattern(pattern);
    } else {
        const pattern = `leaderboard:sport:${category}:*`;
        await deleteCachePattern(pattern);
    }

    // Also invalidate stats
    await deleteCache(CacheKeys.LEADERBOARD.STATS());
};

/**
 * Invalidate user's leaderboard cache
 */
export const invalidateUserLeaderboard = async (userId) => {
    const promises = [
        deleteCache(CacheKeys.LEADERBOARD.USER_RANKING(userId, 'overall')),
        deleteCache(CacheKeys.LEADERBOARD.USER_STATS(userId)),
        deleteCachePattern(`leaderboard:user:${userId}:*`),
    ];

    await Promise.all(promises);
};

/**
 * Invalidate all leaderboards
 * Use when major score changes occur
 */
export const invalidateAllLeaderboards = async () => {
    const pattern = CacheKeys.LEADERBOARD.ALL();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated all ${deleted} leaderboard cache entries`);
};

export default {
    cacheOverallLeaderboard,
    getOverallLeaderboardFromCache,
    cacheSportLeaderboard,
    getSportLeaderboardFromCache,
    cacheMonthlyLeaderboard,
    getMonthlyLeaderboardFromCache,
    cacheUserRanking,
    getUserRankingFromCache,
    cacheLeaderboardStats,
    getLeaderboardStatsFromCache,
    cacheUserAchievements,
    getUserAchievementsFromCache,
    cacheTrophies,
    getTrophiesFromCache,
    cacheUserStats,
    getUserStatsFromCache,
    cacheCategories,
    getCategoriesFromCache,
    invalidateLeaderboard,
    invalidateUserLeaderboard,
    invalidateAllLeaderboards,
};
