import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  addTeam,
  addRating,
  getUserEvents,
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes
router.get('/:id', getEventById);

// Protected routes
router.use(isAuthenticated);
router.post('/', upload.array('eventImages', 5), createEvent);
router.put('/:id', upload.array('eventImages', 5), updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);
router.post('/:id/teams', addTeam);
router.post('/:id/ratings', addRating);
router.get('/user/my-events', getUserEvents);

export default router;