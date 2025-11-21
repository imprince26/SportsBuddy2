import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';

const TTL = getCacheTTL('community');

/**
 * Cache communities list
 */
export const cacheCommunitiesList = async (data, page) => {
    const key = CacheKeys.COMMUNITY.LIST(page);
    await setCache(key, data, TTL);
};

/**
 * Get communities list from cache
 */
export const getCommunitiesListFromCache = async (page) => {
    const key = CacheKeys.COMMUNITY.LIST(page);
    return await getCache(key);
};

/**
 * Cache community detail
 */
export const cacheCommunityDetail = async (communityId, data) => {
    const key = CacheKeys.COMMUNITY.DETAIL(communityId);
    await setCache(key, data, TTL);
};

/**
 * Get community detail from cache
 */
export const getCommunityDetailFromCache = async (communityId) => {
    const key = CacheKeys.COMMUNITY.DETAIL(communityId);
    return await getCache(key);
};

/**
 * Cache featured communities
 */
export const cacheFeaturedCommunities = async (data) => {
    const key = CacheKeys.COMMUNITY.FEATURED();
    await setCache(key, data, TTL * 2);
};

/**
 * Get featured communities from cache
 */
export const getFeaturedCommunitiesFromCache = async () => {
    const key = CacheKeys.COMMUNITY.FEATURED();
    return await getCache(key);
};

/**
 * Cache community stats
 */
export const cacheCommunityStats = async (data) => {
    const key = CacheKeys.COMMUNITY.STATS();
    await setCache(key, data, TTL * 2);
};

/**
 * Get community stats from cache
 */
export const getCommunityStatsFromCache = async () => {
    const key = CacheKeys.COMMUNITY.STATS();
    return await getCache(key);
};

/**
 * Cache user communities
 */
export const cacheUserCommunities = async (userId, data) => {
    const key = CacheKeys.COMMUNITY.USER_COMMUNITIES(userId);
    await setCache(key, data, TTL);
};

/**
 * Get user communities from cache
 */
export const getUserCommunitiesFromCache = async (userId) => {
    const key = CacheKeys.COMMUNITY.USER_COMMUNITIES(userId);
    return await getCache(key);
};

/**
 * Cache community posts
 */
export const cacheCommunityPosts = async (communityId, page, data) => {
    const key = CacheKeys.COMMUNITY.POSTS(communityId, page);
    await setCache(key, data, TTL / 2); // Shorter TTL for posts
};

/**
 * Get community posts from cache
 */
export const getCommunityPostsFromCache = async (communityId, page) => {
    const key = CacheKeys.COMMUNITY.POSTS(communityId, page);
    return await getCache(key);
};

/**
 * Cache post detail
 */
export const cachePostDetail = async (postId, data) => {
    const key = CacheKeys.COMMUNITY.POST_DETAIL(postId);
    await setCache(key, data, TTL);
};

/**
 * Get post detail from cache
 */
export const getPostDetailFromCache = async (postId) => {
    const key = CacheKeys.COMMUNITY.POST_DETAIL(postId);
    return await getCache(key);
};

/**
 * Cache trending posts
 */
export const cacheTrendingPosts = async (page, data) => {
    const key = CacheKeys.COMMUNITY.TRENDING_POSTS(page);
    await setCache(key, data, TTL / 2);
};

/**
 * Get trending posts from cache
 */
export const getTrendingPostsFromCache = async (page) => {
    const key = CacheKeys.COMMUNITY.TRENDING_POSTS(page);
    return await getCache(key);
};

/**
 * Cache following posts feed
 */
export const cacheFollowingPosts = async (userId, page, data) => {
    const key = CacheKeys.COMMUNITY.FOLLOWING_POSTS(userId, page);
    await setCache(key, data, TTL / 4); // Very short TTL for personalized feed
};

/**
 * Get following posts from cache
 */
export const getFollowingPostsFromCache = async (userId, page) => {
    const key = CacheKeys.COMMUNITY.FOLLOWING_POSTS(userId, page);
    return await getCache(key);
};

/**
 * Invalidate community lists
 */
export const invalidateCommunityLists = async () => {
    const patterns = ['community:list:*', CacheKeys.COMMUNITY.FEATURED()];

    for (const pattern of patterns) {
        await deleteCachePattern(pattern);
    }
};

/**
 * Invalidate specific community cache
 */
export const invalidateCommunityDetail = async (communityId) => {
    await deleteCache(CacheKeys.COMMUNITY.DETAIL(communityId));
};

/**
 * Invalidate community posts
 */
export const invalidateCommunityPosts = async (communityId) => {
    const pattern = `community:posts:${communityId}:*`;
    await deleteCachePattern(pattern);
};

/**
 * Invalidate post detail
 */
export const invalidatePostDetail = async (postId) => {
    await deleteCache(CacheKeys.COMMUNITY.POST_DETAIL(postId));
};

/**
 * Invalidate trending posts
 */
export const invalidateTrendingPosts = async () => {
    const pattern = 'community:posts:trending:*';
    await deleteCachePattern(pattern);
};

/**
 * Invalidate user's following feed
 */
export const invalidateFollowingFeed = async (userId) => {
    const pattern = `community:posts:following:${userId}:*`;
    await deleteCachePattern(pattern);
};

/**
 * Invalidate community stats
 */
export const invalidateCommunityStats = async () => {
    await deleteCache(CacheKeys.COMMUNITY.STATS());
};

/**
 * Invalidate all community caches
 */
export const invalidateAllCommunityCaches = async () => {
    const pattern = CacheKeys.COMMUNITY.ALL();
    const deleted = await deleteCachePattern(pattern);
    console.log(`Invalidated all ${deleted} community cache entries`);
};

/**
 * Complete cache invalidation for community changes
 */
export const invalidateCommunityCaches = async (communityId) => {
    await Promise.all([
        invalidateCommunityDetail(communityId),
        invalidateCommunityLists(),
        invalidateCommunityStats(),
    ]);
};

/**
 * Complete cache invalidation for post changes
 */
export const invalidatePostCaches = async (postId, communityId) => {
    await Promise.all([
        invalidatePostDetail(postId),
        invalidateCommunityPosts(communityId),
        invalidateTrendingPosts(),
    ]);
};

export default {
    cacheCommunitiesList,
    getCommunitiesListFromCache,
    cacheCommunityDetail,
    getCommunityDetailFromCache,
    cacheFeaturedCommunities,
    getFeaturedCommunitiesFromCache,
    cacheCommunityStats,
    getCommunityStatsFromCache,
    cacheUserCommunities,
    getUserCommunitiesFromCache,
    cacheCommunityPosts,
    getCommunityPostsFromCache,
    cachePostDetail,
    getPostDetailFromCache,
    cacheTrendingPosts,
    getTrendingPostsFromCache,
    cacheFollowingPosts,
    getFollowingPostsFromCache,
    invalidateCommunityLists,
    invalidateCommunityDetail,
    invalidateCommunityPosts,
    invalidatePostDetail,
    invalidateTrendingPosts,
    invalidateFollowingFeed,
    invalidateCommunityStats,
    invalidateAllCommunityCaches,
    invalidateCommunityCaches,
    invalidatePostCaches,
};
