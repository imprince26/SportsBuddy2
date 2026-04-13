import express from 'express';
import {
    publicSearchLimiter,
    userWriteLimiter,
} from "../middleware/rateLimitMiddleware.js";

import {
    getAllAthletes,
    getAthleteById,
    toggleFollowAthlete,
    getTopAthletes,
    getAthleteAchievements,
    searchAthletes
} from '../controllers/athletesController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllAthletes);

router.get('/search', publicSearchLimiter, searchAthletes);

router.get('/top', getTopAthletes);

router.get('/:id', getAthleteById);

router.get('/:id/achievements', getAthleteAchievements);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/follow', userWriteLimiter, toggleFollowAthlete);

export default router;
