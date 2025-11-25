import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  updatePreferences,
  userStats,
  getUserEvents,
  getUserBookings
} from "../controllers/userController.js";
import { toggleFollowAthlete } from "../controllers/athletesController.js";

const router = express.Router();

// Public routes
router.get("/search", searchUsers);

// Protected routes - MUST come before /:userId to avoid route conflicts
router.get("/my-bookings", isAuthenticated, getUserBookings);
router.get("/events", isAuthenticated, getUserEvents);
router.put("/preferences", isAuthenticated, updatePreferences);

router.post("/:userId/follow", isAuthenticated, toggleFollowAthlete);

router.get("/:userId/followers", isAuthenticated, getUserFollowers);

router.get("/:userId/following", isAuthenticated, getUserFollowing);

router.get("/stats/:userId", isAuthenticated, userStats);

// Public profile route - comes after specific routes
router.get("/:userId", getUserProfile);

export default router;
