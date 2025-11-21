import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";
import { CacheKeys, getCacheTTL } from "../utils/cacheKeys.js";
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

const userTTL = getCacheTTL('users');

// Public routes with caching
router.get("/search", 
  cacheMiddleware((req) => CacheKeys.USERS.SEARCH(req.query.search, req.query.page || 1), userTTL),
  searchUsers
);

router.get("/:userId", 
  cacheMiddleware((req) => CacheKeys.USERS.PROFILE(req.params.userId), userTTL),
  getUserProfile
);

// Protected routes
router.get("/events",isAuthenticated, getUserEvents);
router.put("/preferences",isAuthenticated, updatePreferences);

router.post("/:userId/follow",isAuthenticated, followUser);
router.delete("/:userId/follow",isAuthenticated, unfollowUser);

router.get("/:userId/followers",isAuthenticated, 
  cacheMiddleware((req) => CacheKeys.USERS.FOLLOWERS(req.params.userId, req.query.page || 1), userTTL),
  getUserFollowers
);

router.get("/:userId/following",isAuthenticated, 
  cacheMiddleware((req) => CacheKeys.USERS.FOLLOWING(req.params.userId, req.query.page || 1), userTTL),
  getUserFollowing
);

router.get("/stats/:userId", isAuthenticated,
  cacheMiddleware((req) => CacheKeys.USERS.STATS(req.params.userId), userTTL / 2),
  userStats
);

export default router;
