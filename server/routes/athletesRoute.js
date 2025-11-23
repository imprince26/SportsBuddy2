import express from 'express';
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

router.get('/search', searchAthletes);

router.get('/top', getTopAthletes);

router.get('/:id', getAthleteById);

router.get('/:id/achievements', getAthleteAchievements);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/follow', toggleFollowAthlete);

export default router;