import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';
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

const athletesTTL = getCacheTTL('athletes');

// Public routes with caching
router.get('/', 
  cacheMiddleware((req) => CacheKeys.ATHLETES.LIST(req.query.page || 1, req.query), athletesTTL),
  getAllAthletes
);

router.get('/search', 
  cacheMiddleware((req) => CacheKeys.ATHLETES.SEARCH(req.query.search, req.query.page || 1), athletesTTL),
  searchAthletes
);

router.get('/top', 
  cacheMiddleware(() => CacheKeys.ATHLETES.TOP(), athletesTTL),
  getTopAthletes
);

router.get('/:id', 
  cacheMiddleware((req) => CacheKeys.ATHLETES.DETAIL(req.params.id), athletesTTL),
  getAthleteById
);

router.get('/:id/achievements', 
  cacheMiddleware((req) => CacheKeys.ATHLETES.ACHIEVEMENTS(req.params.id), athletesTTL * 2),
  getAthleteAchievements
);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/follow', toggleFollowAthlete);

export default router;