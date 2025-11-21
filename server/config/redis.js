import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

/**
 * Initialize Upstash Redis client
 * @returns {Redis} Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Redis credentials not configured. Caching will be disabled.');
      return null;
    }

    try {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
        automaticDeserialization: true,
        // Performance optimizations
        keepAlive: true,
        retry: {
          retries: 3,
          backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
        },
      });

      console.log('Redis client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis client:', error.message);
      return null;
    }
  }

  return redisClient;
};

/**
 * Check Redis connection health
 * @returns {Promise<boolean>} Connection status
 */
export const checkRedisHealth = async () => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const result = await client.ping();
    console.log('Redis health check:', result);
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error.message);
    return false;
  }
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const value = await client.get(key);
    return value;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
export const setCache = async (key, value, ttl = null) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const defaultTTL = parseInt(process.env.CACHE_DEFAULT_TTL) || 3600;
    const expiryTime = ttl || defaultTTL;

    // Don't stringify - let Redis client handle serialization automatically
    await client.setex(key, expiryTime, value);
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'events:*')
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (!client) return 0;

    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;

    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Cache pattern delete error for pattern ${pattern}:`, error.message);
    return 0;
  }
};

/**
 * Increment counter in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} New counter value
 */
export const incrementCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return 0;

    const value = await client.incr(key);
    return value;
  } catch (error) {
    console.error(`Cache increment error for key ${key}:`, error.message);
    return 0;
  }
};

/**
 * Set expiration on existing key
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
export const expireCache = async (key, ttl) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.expire(key, ttl);
    return true;
  } catch (error) {
    console.error(`Cache expire error for key ${key}:`, error.message);
    return false;
  }
};

export default getRedisClient;
