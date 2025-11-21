import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from './redis.js';

const createUpstashRateLimiter = (config) => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('Redis not available, rate limiting disabled for:', config.name);
    return null;
  }

  try {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, config.window),
      analytics: true,
      prefix: config.prefix || 'ratelimit',
    });
  } catch (error) {
    console.error(`Failed to create rate limiter for ${config.name}:`, error.message);
    return null;
  }
};

// Rate limiter configurations
const rateLimiterConfigs = {
  global: {
    name: 'global',
    limit: 1000,
    window: '30 m',
    prefix: 'rl:global',
  },
  auth: {
    name: 'auth',
    limit: 10,
    window: '30 m',
    prefix: 'rl:auth',
  },
  api: {
    name: 'api',
    limit: 300,
    window: '15 m',
    prefix: 'rl:api',
  },
  admin: {
    name: 'admin',
    limit: 500,
    window: '15 m',
    prefix: 'rl:admin',
  },
  upload: {
    name: 'upload',
    limit: 20,
    window: '15 m',
    prefix: 'rl:upload',
  },
  search: {
    name: 'search',
    limit: 30,
    window: '1 m',
    prefix: 'rl:search',
  },
};

// Initialize rate limiters
const rateLimiters = {
  global: createUpstashRateLimiter(rateLimiterConfigs.global),
  auth: createUpstashRateLimiter(rateLimiterConfigs.auth),
  api: createUpstashRateLimiter(rateLimiterConfigs.api),
  admin: createUpstashRateLimiter(rateLimiterConfigs.admin),
  upload: createUpstashRateLimiter(rateLimiterConfigs.upload),
  search: createUpstashRateLimiter(rateLimiterConfigs.search),
};

const getRateLimitKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip}`;
};

export const createRateLimitMiddleware = (type, options = {}) => {
  const limiter = rateLimiters[type];
  const config = rateLimiterConfigs[type];

  return async (req, res, next) => {
    // If rate limiter not available, skip rate limiting
    if (!limiter) {
      return next();
    }

    try {
      // Skip for superadmin if configured
      if (options.skipSuperAdmin && req.user?.role === 'superadmin') {
        return next();
      }

      const key = getRateLimitKey(req);
      const { success, limit, reset, remaining } = await limiter.limit(key);

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        
        // Log rate limit exceeded
        console.warn(`Rate limit exceeded for ${key} on ${req.path}`, {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id || 'anonymous',
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        });

        return res.status(429).json({
          success: false,
          message: `Too many requests. Please try again later.`,
          retryAfter,
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error.message);
      // On error, allow request to proceed
      next();
    }
  };
};

// Export pre-configured middleware
export const upstashRateLimiters = {
  global: createRateLimitMiddleware('global'),
  auth: createRateLimitMiddleware('auth'),
  api: createRateLimitMiddleware('api'),
  admin: createRateLimitMiddleware('admin', { skipSuperAdmin: true }),
  upload: createRateLimitMiddleware('upload'),
  search: createRateLimitMiddleware('search'),
};

export default upstashRateLimiters;
