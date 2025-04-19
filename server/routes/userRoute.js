import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  updatePreferences
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.get("/:userId", getUserProfile);
router.get("/search", searchUsers);

// Protected routes
router.use(isAuthenticated);
router.post("/:userId/follow", followUser);
router.delete("/:userId/follow", unfollowUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);
router.put("/preferences", updatePreferences);

export default router;
