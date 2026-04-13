import express from 'express';
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
import { isAuthenticated, isAdmin, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
    publicSearchLimiter,
    userWriteLimiter,
    uploadLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllVenues);

router.get('/search', publicSearchLimiter, searchVenues);

router.get('/nearby', publicSearchLimiter, getNearbyVenues);

router.get('/category/:category', getVenuesByCategory);

router.get('/:id', getVenueById);

router.get('/:id/reviews', getVenueReviews);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/reviews', userWriteLimiter, addVenueReview);
router.post('/:id/book', userWriteLimiter, bookVenue);
router.post('/:id/favorite', userWriteLimiter, toggleVenueFavorite);
router.get('/:id/bookings', getVenueBookings);

// Admin and owner routes
router.post('/', isAdmin, userWriteLimiter, uploadLimiter, upload.array('images', 10), createVenue);
router.put('/:id', userWriteLimiter, uploadLimiter, upload.array('images', 10), updateVenue); // Owner or admin can update
router.delete('/:id', userWriteLimiter, deleteVenue); // Owner or admin can delete

export default router;
