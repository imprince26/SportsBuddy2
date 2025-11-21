import { getCache, setCache } from '../config/redis.js';

export const cacheMiddleware = (getCacheKey, ttl = null) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            const cacheKey = typeof getCacheKey === 'function'
                ? getCacheKey(req)
                : getCacheKey;

            // Try to get from cache
            const cacheStart = Date.now();
            const cachedData = await getCache(cacheKey);
            const cacheTime = Date.now() - cacheStart;

            if (cachedData) {
                // Cache hit
                console.log(`Cache HIT: ${cacheKey} (${cacheTime}ms)`);

                // Data is already deserialized by Redis client
                return res.status(200).json({
                    ...cachedData,
                    fromCache: true,
                    cacheKey: process.env.NODE_ENV === 'development' ? cacheKey : undefined,
                });
            }

            // Cache miss - continue to controller
            console.log(`Cache MISS: ${cacheKey} (${cacheTime}ms)`);

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode === 200 && data.success !== false) {
                    // Store clean data without fromCache flag
                    const dataToCache = { ...data };
                    delete dataToCache.fromCache;
                    delete dataToCache.cacheKey;

                    setCache(cacheKey, dataToCache, ttl).catch(err => {
                        console.error(`Failed to cache response for ${cacheKey}:`, err.message);
                    });
                }

                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error.message);
            next();
        }
    };
};

export const noCacheMiddleware = () => {
    return (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    };
};

export default cacheMiddleware;
