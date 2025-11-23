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

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllVenues);

router.get('/search', searchVenues);

router.get('/nearby', getNearbyVenues);

router.get('/category/:category', getVenuesByCategory);

router.get('/:id', getVenueById);

router.get('/:id/reviews', getVenueReviews);

// Protected routes
router.use(isAuthenticated);
router.post('/:id/reviews', addVenueReview);
router.post('/:id/book', bookVenue);
router.post('/:id/favorite', toggleVenueFavorite);
router.get('/:id/bookings', getVenueBookings);

// Admin and owner routes
router.post('/', isAdmin, upload.array('images', 10), createVenue);
router.put('/:id', upload.array('images', 10), updateVenue); // Owner or admin can update
router.delete('/:id', deleteVenue); // Owner or admin can delete

export default router;