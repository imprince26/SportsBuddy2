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
  getUserEvents
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.get("/search", searchUsers);

router.get("/events",isAuthenticated, getUserEvents);
router.put("/preferences",isAuthenticated, updatePreferences);

router.get("/:userId", getUserProfile);
router.post("/:userId/follow",isAuthenticated, followUser);
router.delete("/:userId/follow",isAuthenticated, unfollowUser);
router.get("/:userId/followers",isAuthenticated, getUserFollowers);
router.get("/:userId/following",isAuthenticated, getUserFollowing);
router.get("/stats/:userId", isAuthenticated,userStats);

export default router;
