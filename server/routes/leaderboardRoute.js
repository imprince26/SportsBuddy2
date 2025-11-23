import express from 'express';
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

// Public routes
router.get('/', getLeaderboard);

router.get('/categories', getCategories);

router.get('/sport/:sport', getLeaderboardBySport);

router.get('/stats', getLeaderboardStats);

router.get('/achievements/:userId', getAchievements);

router.get('/trophies', getTrophies);

// Protected routes (require authentication)
router.use(isAuthenticated);

router.get('/user/:userId/ranking', getUserRanking);

router.get('/user/:userId/stats', getUserStats);

router.get('/monthly', getMonthlyLeaderboard);

// Admin routes (require admin privileges)
router.post('/user/:userId/score', isAdmin, updateUserScore);

export default router;