import express from 'express';
const router = express.Router();
import {
    getDashboardAnalytics,
    exportAnalyticsPDF,
    manageUsers,
    getUserById,
    updateUser,
    deleteUser,
    manageEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    exportEvents,
    getEventStats,
    manageCommunities,
    getCommunityById,
    updateCommunityAdmin,
    deleteCommunityAdmin,
    adminSearch,
    getAllVenueBookings,
} from '../controllers/adminController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

router.use(isAuthenticated, isAdmin);

// Dashboard & Analytics
router.route('/analytics').get(getDashboardAnalytics);
router.route('/analytics/export').get(exportAnalyticsPDF);

// User Management
router.route('/users').get(manageUsers);
router.route('/users/:id').get(getUserById).put(updateUser).delete(deleteUser);

// Event Management
router.route('/events').get(manageEvents);
router.route('/events/stats').get(getEventStats);
router.route('/events/export').get(exportEvents);
router.route('/events/:id').get(getEventById).put(updateEvent).delete(deleteEvent);
router.route('/events/:id/approve').put(approveEvent);
router.route('/events/:id/reject').put(rejectEvent);

// Community Management
router.route('/communities').get(manageCommunities);
router.route('/communities/:id').get(getCommunityById).put(updateCommunityAdmin).delete(deleteCommunityAdmin);

// Search
router.route('/search').get(adminSearch);

// Venue Bookings
router.route('/venue-bookings').get(getAllVenueBookings);

export default router;