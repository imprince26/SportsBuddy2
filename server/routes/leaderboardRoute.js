import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';
import {
    getLeaderboard,
    getLeaderboardBySport,
    getUserRanking,
    getLeaderboardStats,
    updateUserScore,
    getAchievements,
    getTrophies,
    getMonthlyLeaderboard,
    getUserStats,
    getCategories
} from '../controllers/leaderboardController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const leaderboardTTL = getCacheTTL('leaderboard');

// Public routes with caching
router.get('/', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.OVERALL(req.query.page || 1), leaderboardTTL),
  getLeaderboard
);

router.get('/categories', 
  cacheMiddleware(() => CacheKeys.LEADERBOARD.CATEGORIES(), leaderboardTTL * 4),
  getCategories
);

router.get('/sport/:sport', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.SPORT(req.params.sport, req.query.page || 1), leaderboardTTL),
  getLeaderboardBySport
);

router.get('/stats', 
  cacheMiddleware(() => CacheKeys.LEADERBOARD.STATS(), leaderboardTTL * 2),
  getLeaderboardStats
);

router.get('/achievements/:userId', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.ACHIEVEMENTS(req.params.userId), leaderboardTTL * 4),
  getAchievements
);

router.get('/trophies', 
  cacheMiddleware(() => CacheKeys.LEADERBOARD.TROPHIES(), leaderboardTTL * 4),
  getTrophies
);

// Protected routes (require authentication)
router.use(isAuthenticated);

router.get('/user/:userId/ranking', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.USER_RANKING(req.params.userId), leaderboardTTL / 2),
  getUserRanking
);

router.get('/user/:userId/stats', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.USER_STATS(req.params.userId), leaderboardTTL),
  getUserStats
);

router.get('/monthly', 
  cacheMiddleware((req) => CacheKeys.LEADERBOARD.MONTHLY(req.query.page || 1), leaderboardTTL * 2),
  getMonthlyLeaderboard
);

// Admin routes (require admin privileges)
router.post('/user/:userId/score', isAdmin, updateUserScore);

export default router;