import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  addTeam,
  addRating,
  sendMessage,
  getUserEvents,
  searchEvents,
  getNearbyEvents,
   getFeaturedEvents,
  getTrendingEvents,
  getUpcomingEvents
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes - caching now handled in controllers
router.get('/', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/featured', getFeaturedEvents);
router.get('/trending', getTrendingEvents);
router.get('/search', searchEvents);
router.get('/nearby', getNearbyEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(isAuthenticated);

router.post('/', upload.array('images', 5), createEvent);
router.put('/:id', upload.array('images', 5), updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);
router.post('/:id/teams', addTeam);
router.post('/:id/ratings', addRating);
router.post('/:id/messages', sendMessage);
router.get('/user/:userId', getUserEvents);

export default router;
