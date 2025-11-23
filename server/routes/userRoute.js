import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  updatePreferences,
  userStats,
  getUserEvents,
  getUserBookings
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.get("/search", searchUsers);

// Protected routes - MUST come before /:userId to avoid route conflicts
router.get("/my-bookings", isAuthenticated, getUserBookings);
router.get("/events", isAuthenticated, getUserEvents);
router.put("/preferences", isAuthenticated, updatePreferences);

// Public profile route - comes after specific routes
router.get("/:userId", getUserProfile);

// User interaction routes
router.post("/:userId/follow", isAuthenticated, followUser);
router.delete("/:userId/follow", isAuthenticated, unfollowUser);

router.get("/:userId/followers", isAuthenticated, getUserFollowers);

router.get("/:userId/following", isAuthenticated, getUserFollowing);

router.get("/stats/:userId", isAuthenticated, userStats);

export default router;
