import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';

const TTL = getCacheTTL('events');

/**
 * Cache all events list
 */
export const cacheEventsList = async (data, page, filters) => {
    const key = CacheKeys.EVENTS.LIST(page, filters);
    await setCache(key, data, TTL);
};

/**
 * Get events list from cache
 */
export const getEventsListFromCache = async (page, filters) => {
    const key = CacheKeys.EVENTS.LIST(page, filters);
    return await getCache(key);
};

/**
 * Cache single event details
 */
export const cacheEventDetail = async (eventId, data) => {
    const key = CacheKeys.EVENTS.DETAIL(eventId);
    await setCache(key, data, TTL * 2); // Longer TTL for details
};

/**
 * Get single event from cache
 */
export const getEventDetailFromCache = async (eventId) => {
    const key = CacheKeys.EVENTS.DETAIL(eventId);
    return await getCache(key);
};

/**
 * Cache featured events
 */
export const cacheFeaturedEvents = async (data) => {
    const key = CacheKeys.EVENTS.FEATURED();
    await setCache(key, data, TTL * 4); // Longer TTL for featured
};

/**
 * Get featured events from cache
 */
export const getFeaturedEventsFromCache = async () => {
    const key = CacheKeys.EVENTS.FEATURED();
    return await getCache(key);
};

/**
 * Cache trending events
 */
export const cacheTrendingEvents = async (data) => {
    const key = CacheKeys.EVENTS.TRENDING();
    await setCache(key, data, TTL / 2); // Shorter TTL for trending
};

/**
 * Get trending events from cache
 */
export const getTrendingEventsFromCache = async () => {
    const key = CacheKeys.EVENTS.TRENDING();
    return await getCache(key);
};

/**
 * Cache user events
 */
export const cacheUserEvents = async (userId, data) => {
    const key = CacheKeys.EVENTS.USER_EVENTS(userId);
    await setCache(key, data, TTL);
};

/**
 * Get user events from cache
 */
export const getUserEventsFromCache = async (userId) => {
    const key = CacheKeys.EVENTS.USER_EVENTS(userId);
    return await getCache(key);
};

/**
 * Invalidate all event list caches
 */
export const invalidateEventLists = async () => {
    const pattern = CacheKeys.EVENTS.ALL_LISTS();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated ${deleted} event list cache entries`);

    // Also invalidate featured and trending
    await deleteCache(CacheKeys.EVENTS.FEATURED());
    await deleteCache(CacheKeys.EVENTS.TRENDING());
};

/**
 * Invalidate specific event cache
 */
export const invalidateEventDetail = async (eventId) => {
    const key = CacheKeys.EVENTS.DETAIL(eventId);
    await deleteCache(key);
    console.log(`Invalidated event cache for ID: ${eventId}`);
};

/**
 * Invalidate user's event cache
 */
export const invalidateUserEventCache = async (userId) => {
    const key = CacheKeys.EVENTS.USER_EVENTS(userId);
    await deleteCache(key);
};

/**
 * Invalidate all event-related caches
 * Use when major changes occur
 */
export const invalidateAllEventCaches = async () => {
    const pattern = CacheKeys.EVENTS.ALL_EVENTS();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated all ${deleted} event cache entries`);
};

/**
 * Complete cache invalidation for event changes
 * Call this when event is created/updated/deleted
 */
export const invalidateEventCaches = async (eventId, createdBy) => {
    await Promise.all([
        invalidateEventDetail(eventId),
        invalidateEventLists(),
        invalidateUserEventCache(createdBy),
    ]);
};

export default {
    cacheEventsList,
    getEventsListFromCache,
    cacheEventDetail,
    getEventDetailFromCache,
    cacheFeaturedEvents,
    getFeaturedEventsFromCache,
    cacheTrendingEvents,
    getTrendingEventsFromCache,
    cacheUserEvents,
    getUserEventsFromCache,
    invalidateEventLists,
    invalidateEventDetail,
    invalidateUserEventCache,
    invalidateAllEventCaches,
    invalidateEventCaches,
};
