import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';
import {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue,
    getNearbyVenues,
    searchVenues,
    addVenueReview,
    getVenueReviews,
    bookVenue,
    getVenueBookings,
    getVenuesByCategory,
    toggleVenueFavorite
} from '../controllers/venueController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

const venueTTL = getCacheTTL('venues');

// Public routes with caching
router.get('/', 
  cacheMiddleware((req) => CacheKeys.VENUES.LIST(req.query.page || 1, req.query), venueTTL),
  getAllVenues
);

router.get('/search', 
  cacheMiddleware((req) => CacheKeys.VENUES.SEARCH(req.query.search, req.query.page || 1), venueTTL),
  searchVenues
);

router.get('/nearby', 
  cacheMiddleware((req) => CacheKeys.VENUES.NEARBY(req.query.lat, req.query.lng, req.query.radius || 10), venueTTL),
  getNearbyVenues
);

router.get('/category/:category', 
  cacheMiddleware((req) => CacheKeys.VENUES.CATEGORY(req.params.category, req.query.page || 1), venueTTL),
  getVenuesByCategory
);

router.get('/:id', 
  cacheMiddleware((req) => CacheKeys.VENUES.DETAIL(req.params.id), venueTTL),
  getVenueById
);

router.get('/:id/reviews', 
  cacheMiddleware((req) => CacheKeys.VENUES.REVIEWS(req.params.id, req.query.page || 1), venueTTL / 2),
  getVenueReviews
);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/reviews', addVenueReview);
router.post('/:id/book', bookVenue);
router.post('/:id/favorite', toggleVenueFavorite);
router.get('/:id/bookings', getVenueBookings);

// Admin routes
router.post('/', isAdmin, upload.array('images', 10), createVenue);
router.put('/:id', isAdmin, upload.array('images', 10), updateVenue);
router.delete('/:id', isAdmin, deleteVenue);

export default router;