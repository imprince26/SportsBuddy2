import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  publicSearchLimiter,
  userWriteLimiter,
  uploadLimiter,
} from "../middleware/rateLimitMiddleware.js";
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
import {
  createEventPaymentOrder,
  getEventPaymentStatus,
  handleRazorpayWebhook,
  verifyEventPayment,
} from '../controllers/eventPaymentController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  eventPaymentParamsSchema,
  verifyEventPaymentBodySchema,
} from '../validators/eventPaymentValidators.js';

const router = express.Router();

// Public routes - caching now handled in controllers
router.get('/', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/featured', getFeaturedEvents);
router.get('/trending', getTrendingEvents);
router.get('/search', publicSearchLimiter, searchEvents);
router.get('/nearby', publicSearchLimiter, getNearbyEvents);
router.post('/payments/webhook/razorpay', handleRazorpayWebhook);
router.get('/:id', getEventById);

// Protected routes
router.use(isAuthenticated);

router.post('/', userWriteLimiter, uploadLimiter, upload.array('images', 5), createEvent);
router.put('/:id', userWriteLimiter, uploadLimiter, upload.array('images', 5), updateEvent);
router.delete('/:id', userWriteLimiter, deleteEvent);
router.post('/:id/join', userWriteLimiter, joinEvent);
router.post(
  '/:id/payment/order',
  userWriteLimiter,
  validateRequest({ params: eventPaymentParamsSchema }),
  createEventPaymentOrder
);
router.post(
  '/:id/payment/verify',
  userWriteLimiter,
  validateRequest({ params: eventPaymentParamsSchema, body: verifyEventPaymentBodySchema }),
  verifyEventPayment
);
router.get(
  '/:id/payment/status',
  validateRequest({ params: eventPaymentParamsSchema }),
  getEventPaymentStatus
);
router.post('/:id/leave', userWriteLimiter, leaveEvent);
router.post('/:id/teams', userWriteLimiter, addTeam);
router.post('/:id/ratings', userWriteLimiter, addRating);
router.post('/:id/messages', userWriteLimiter, sendMessage);
router.get('/user/:userId', getUserEvents);

export default router;
