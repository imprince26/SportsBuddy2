import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';

const TTL = getCacheTTL('athletes');

/**
 * Cache athletes list
 */
export const cacheAthletesList = async (data, page, filters) => {
    const key = CacheKeys.ATHLETES.LIST(page, filters);
    await setCache(key, data, TTL);
};

/**
 * Get athletes list from cache
 */
export const getAthletesListFromCache = async (page, filters) => {
    const key = CacheKeys.ATHLETES.LIST(page, filters);
    return await getCache(key);
};

/**
 * Cache athlete detail
 */
export const cacheAthleteDetail = async (userId, data) => {
    const key = CacheKeys.ATHLETES.DETAIL(userId);
    await setCache(key, data, TTL);
};

/**
 * Get athlete detail from cache
 */
export const getAthleteDetailFromCache = async (userId) => {
    const key = CacheKeys.ATHLETES.DETAIL(userId);
    return await getCache(key);
};

/**
 * Cache top athletes
 */
export const cacheTopAthletes = async (data) => {
    const key = CacheKeys.ATHLETES.TOP();
    await setCache(key, data, TTL);
};

/**
 * Get top athletes from cache
 */
export const getTopAthletesFromCache = async () => {
    const key = CacheKeys.ATHLETES.TOP();
    return await getCache(key);
};

/**
 * Cache athlete achievements
 */
export const cacheAthleteAchievements = async (userId, data) => {
    const key = CacheKeys.ATHLETES.ACHIEVEMENTS(userId);
    await setCache(key, data, TTL * 2);
};

/**
 * Get athlete achievements from cache
 */
export const getAthleteAchievementsFromCache = async (userId) => {
    const key = CacheKeys.ATHLETES.ACHIEVEMENTS(userId);
    return await getCache(key);
};

/**
 * Invalidate athlete lists
 */
export const invalidateAthleteLists = async () => {
    const patterns = ['athletes:list:*', CacheKeys.ATHLETES.TOP()];

    for (const pattern of patterns) {
        await deleteCachePattern(pattern);
    }
};

/**
 * Invalidate specific athlete cache
 */
export const invalidateAthleteDetail = async (userId) => {
    await deleteCache(CacheKeys.ATHLETES.DETAIL(userId));
};

/**
 * Invalidate athlete achievements
 */
export const invalidateAthleteAchievements = async (userId) => {
    await deleteCache(CacheKeys.ATHLETES.ACHIEVEMENTS(userId));
};

/**
 * Invalidate all athlete caches
 */
export const invalidateAllAthleteCaches = async () => {
    const pattern = CacheKeys.ATHLETES.ALL();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated all ${deleted} athlete cache entries`);
};

export default {
    cacheAthletesList,
    getAthletesListFromCache,
    cacheAthleteDetail,
    getAthleteDetailFromCache,
    cacheTopAthletes,
    getTopAthletesFromCache,
    cacheAthleteAchievements,
    getAthleteAchievementsFromCache,
    invalidateAthleteLists,
    invalidateAthleteDetail,
    invalidateAthleteAchievements,
    invalidateAllAthleteCaches,
};
