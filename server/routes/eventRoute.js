import express from 'express';
import { cloudinaryUpload } from '../middleware/cloudinaryUpload.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
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
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/', isAuthenticated, cloudinaryUpload.array('eventImages', 5), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', isAuthenticated, cloudinaryUpload.array('eventImages', 5), updateEvent);
router.delete('/:id', isAuthenticated, deleteEvent);
router.post('/:id/join', isAuthenticated, joinEvent);
router.post('/:id/leave', isAuthenticated, leaveEvent);
router.post('/:id/teams', isAuthenticated, addTeam);
router.post('/:id/ratings', isAuthenticated, addRating);
router.post('/:id/chat', isAuthenticated, sendMessage);
router.get('/user', isAuthenticated, getUserEvents);

export default router;