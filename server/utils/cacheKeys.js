/**
 * Centralized cache key definitions for consistent naming
 * Convention: {module}:{type}:{identifier}:{filter}
 */

export const CacheKeys = {
  // Events
  EVENTS: {
    LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `events:list:page:${page}${filterStr}`;
    },
    DETAIL: (eventId) => `events:detail:${eventId}`,
    FEATURED: () => 'events:featured',
    TRENDING: () => 'events:trending',
    NEARBY: (lat, lng, radius) => `events:nearby:${lat}:${lng}:${radius}`,
    SEARCH: (query, page = 1) => `events:search:${encodeURIComponent(query)}:page:${page}`,
    USER_EVENTS: (userId) => `events:user:${userId}`,
    ALL_LISTS: () => 'events:list:*',
    ALL_EVENTS: () => 'events:*',
  },

  // Leaderboard
  LEADERBOARD: {
    OVERALL: (page = 1) => `leaderboard:overall:page:${page}`,
    SPORT: (sport, page = 1) => `leaderboard:sport:${sport}:page:${page}`,
    MONTHLY: (page = 1) => `leaderboard:monthly:page:${page}`,
    USER_RANKING: (userId, category = 'overall') => `leaderboard:user:${userId}:${category}`,
    STATS: () => 'leaderboard:stats',
    ACHIEVEMENTS: (userId) => `leaderboard:achievements:${userId}`,
    TROPHIES: () => 'leaderboard:trophies',
    CATEGORIES: () => 'leaderboard:categories',
    USER_STATS: (userId) => `leaderboard:user:stats:${userId}`,
    ALL: () => 'leaderboard:*',
  },

  // Athletes
  ATHLETES: {
    LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `athletes:list:page:${page}${filterStr}`;
    },
    DETAIL: (userId) => `athletes:detail:${userId}`,
    TOP: () => 'athletes:top',
    SEARCH: (query, page = 1) => `athletes:search:${encodeURIComponent(query)}:page:${page}`,
    ACHIEVEMENTS: (userId) => `athletes:achievements:${userId}`,
    ALL: () => 'athletes:*',
  },

  // Venues
  VENUES: {
    LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `venues:list:page:${page}${filterStr}`;
    },
    DETAIL: (venueId) => `venues:detail:${venueId}`,
    NEARBY: (lat, lng, radius) => `venues:nearby:${lat}:${lng}:${radius}`,
    CATEGORY: (category, page = 1) => `venues:category:${category}:page:${page}`,
    SEARCH: (query, page = 1) => `venues:search:${encodeURIComponent(query)}:page:${page}`,
    REVIEWS: (venueId, page = 1) => `venues:reviews:${venueId}:page:${page}`,
    BOOKINGS: (venueId) => `venues:bookings:${venueId}`,
    ALL: () => 'venues:*',
  },

  // Community
  COMMUNITY: {
    LIST: (page = 1) => `community:list:page:${page}`,
    DETAIL: (communityId) => `community:detail:${communityId}`,
    SEARCH: (query, page = 1) => `community:search:${encodeURIComponent(query)}:page:${page}`,
    FEATURED: () => 'community:featured',
    STATS: () => 'community:stats',
    USER_COMMUNITIES: (userId) => `community:user:${userId}`,
    POSTS: (communityId, page = 1) => `community:posts:${communityId}:page:${page}`,
    POST_DETAIL: (postId) => `community:post:${postId}`,
    TRENDING_POSTS: (page = 1) => `community:posts:trending:page:${page}`,
    FOLLOWING_POSTS: (userId, page = 1) => `community:posts:following:${userId}:page:${page}`,
    ALL: () => 'community:*',
  },

  // Users
  USERS: {
    PROFILE: (userId) => `user:profile:${userId}`,
    STATS: (userId) => `user:stats:${userId}`,
    FOLLOWERS: (userId, page = 1) => `user:followers:${userId}:page:${page}`,
    FOLLOWING: (userId, page = 1) => `user:following:${userId}:page:${page}`,
    EVENTS: (userId) => `user:events:${userId}`,
    SEARCH: (query, page = 1) => `user:search:${encodeURIComponent(query)}:page:${page}`,
    ALL: (userId) => `user:${userId}:*`,
  },

  // Admin
  ADMIN: {
    ANALYTICS: () => 'admin:analytics',
    USERS_LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `admin:users:list:page:${page}${filterStr}`;
    },
    USER_DETAIL: (userId) => `admin:user:${userId}`,
    EVENTS_LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `admin:events:list:page:${page}${filterStr}`;
    },
    EVENT_DETAIL: (eventId) => `admin:event:${eventId}`,
    EVENT_STATS: () => 'admin:stats:events',
    COMMUNITIES_LIST: (page = 1, filters = {}) => {
      const filterStr = Object.keys(filters).length > 0 
        ? `:${Object.entries(filters).map(([k, v]) => `${k}:${v}`).join(':')}` 
        : '';
      return `admin:communities:list:page:${page}${filterStr}`;
    },
    COMMUNITY_DETAIL: (communityId) => `admin:community:${communityId}`,
    ALL: () => 'admin:*',
  },

  // Notifications
  NOTIFICATIONS: {
    USER: (userId, page = 1) => `notifications:user:${userId}:page:${page}`,
    UNREAD_COUNT: (userId) => `notifications:unread:${userId}`,
    ALL: (userId) => `notifications:${userId}:*`,
  },

  // Session/Temporary
  SESSION: {
    OTP: (userId) => `session:otp:${userId}`,
    RESET_TOKEN: (token) => `session:reset:${token}`,
    VERIFY_TOKEN: (token) => `session:verify:${token}`,
    UPLOAD_SESSION: (sessionId) => `session:upload:${sessionId}`,
  },
};

/**
 * Get TTL for specific cache type
 * @param {string} type - Cache type (events, leaderboard, etc.)
 * @returns {number} TTL in seconds
 */
export const getCacheTTL = (type) => {
  const ttlMap = {
    events: parseInt(process.env.CACHE_EVENTS_TTL) || 1800,
    leaderboard: parseInt(process.env.CACHE_LEADERBOARD_TTL) || 900,
    athletes: parseInt(process.env.CACHE_ATHLETES_TTL) || 3600,
    venues: parseInt(process.env.CACHE_VENUES_TTL) || 3600,
    community: parseInt(process.env.CACHE_COMMUNITY_TTL) || 1800,
    admin: parseInt(process.env.CACHE_ADMIN_TTL) || 1800,
    users: 7200, // 2 hours
    notifications: 300, // 5 minutes
    session: 300, // 5 minutes
    default: parseInt(process.env.CACHE_DEFAULT_TTL) || 3600,
  };

  return ttlMap[type] || ttlMap.default;
};

export default CacheKeys;
