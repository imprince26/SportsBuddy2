import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';

const TTL = getCacheTTL('venues');

/**
 * Cache venues list
 */
export const cacheVenuesList = async (data, page, filters) => {
    const key = CacheKeys.VENUES.LIST(page, filters);
    await setCache(key, data, TTL);
};

/**
 * Get venues list from cache
 */
export const getVenuesListFromCache = async (page, filters) => {
    const key = CacheKeys.VENUES.LIST(page, filters);
    return await getCache(key);
};

/**
 * Cache venue detail
 */
export const cacheVenueDetail = async (venueId, data) => {
    const key = CacheKeys.VENUES.DETAIL(venueId);
    await setCache(key, data, TTL);
};

/**
 * Get venue detail from cache
 */
export const getVenueDetailFromCache = async (venueId) => {
    const key = CacheKeys.VENUES.DETAIL(venueId);
    return await getCache(key);
};

/**
 * Cache nearby venues
 */
export const cacheNearbyVenues = async (lat, lng, radius, data) => {
    const key = CacheKeys.VENUES.NEARBY(lat, lng, radius);
    await setCache(key, data, TTL);
};

/**
 * Get nearby venues from cache
 */
export const getNearbyVenuesFromCache = async (lat, lng, radius) => {
    const key = CacheKeys.VENUES.NEARBY(lat, lng, radius);
    return await getCache(key);
};

/**
 * Cache venues by category
 */
export const cacheVenuesByCategory = async (category, page, data) => {
    const key = CacheKeys.VENUES.CATEGORY(category, page);
    await setCache(key, data, TTL);
};

/**
 * Get venues by category from cache
 */
export const getVenuesByCategoryFromCache = async (category, page) => {
    const key = CacheKeys.VENUES.CATEGORY(category, page);
    return await getCache(key);
};

/**
 * Cache venue reviews
 */
export const cacheVenueReviews = async (venueId, page, data) => {
    const key = CacheKeys.VENUES.REVIEWS(venueId, page);
    await setCache(key, data, TTL / 2); // Shorter TTL for reviews
};

/**
 * Get venue reviews from cache
 */
export const getVenueReviewsFromCache = async (venueId, page) => {
    const key = CacheKeys.VENUES.REVIEWS(venueId, page);
    return await getCache(key);
};

/**
 * Cache venue bookings
 */
export const cacheVenueBookings = async (venueId, data) => {
    const key = CacheKeys.VENUES.BOOKINGS(venueId);
    await setCache(key, data, 300); // 5 minutes for bookings
};

/**
 * Get venue bookings from cache
 */
export const getVenueBookingsFromCache = async (venueId) => {
    const key = CacheKeys.VENUES.BOOKINGS(venueId);
    return await getCache(key);
};

/**
 * Invalidate venue lists
 */
export const invalidateVenueLists = async () => {
    const patterns = ['venues:list:*', 'venues:category:*', 'venues:nearby:*'];

    for (const pattern of patterns) {
        await deleteCachePattern(pattern);
    }
};

/**
 * Invalidate specific venue cache
 */
export const invalidateVenueDetail = async (venueId) => {
    await deleteCache(CacheKeys.VENUES.DETAIL(venueId));
};

/**
 * Invalidate venue reviews
 */
export const invalidateVenueReviews = async (venueId) => {
    const pattern = `venues:reviews:${venueId}:*`;
    await deleteCachePattern(pattern);
};

/**
 * Invalidate venue bookings
 */
export const invalidateVenueBookings = async (venueId) => {
    await deleteCache(CacheKeys.VENUES.BOOKINGS(venueId));
};

/**
 * Invalidate all venue caches
 */
export const invalidateAllVenueCaches = async () => {
    const pattern = CacheKeys.VENUES.ALL();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated all ${deleted} venue cache entries`);
};

/**
 * Complete cache invalidation for venue changes
 */
export const invalidateVenueCaches = async (venueId) => {
    await Promise.all([
        invalidateVenueDetail(venueId),
        invalidateVenueLists(),
        invalidateVenueReviews(venueId),
    ]);
};

export default {
    cacheVenuesList,
    getVenuesListFromCache,
    cacheVenueDetail,
    getVenueDetailFromCache,
    cacheNearbyVenues,
    getNearbyVenuesFromCache,
    cacheVenuesByCategory,
    getVenuesByCategoryFromCache,
    cacheVenueReviews,
    getVenueReviewsFromCache,
    cacheVenueBookings,
    getVenueBookingsFromCache,
    invalidateVenueLists,
    invalidateVenueDetail,
    invalidateVenueReviews,
    invalidateVenueBookings,
    invalidateAllVenueCaches,
    invalidateVenueCaches,
};
