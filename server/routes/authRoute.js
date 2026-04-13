import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  authLoginLimiter,
  authRegisterLimiter,
  passwordResetLimiter,
  userWriteLimiter,
  uploadLimiter,
} from "../middleware/rateLimitMiddleware.js";

import {
  register,
  login,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
  updatePassword,
  getNotifications,
  markNotificationRead,
  addAchievement,
  getUserProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  deleteNotification,
  markAllNotificationsRead
} from "../controllers/authController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.post("/register", authRegisterLimiter, register);
router.post("/login", authLoginLimiter, login);
router.post("/logout", logout);
router.get("/user/:userId", getUserProfile);

// Password reset routes (public)
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/verify-reset-code", passwordResetLimiter, verifyResetCode);
router.post("/reset-password", passwordResetLimiter, resetPassword);


// Protected routes
router.use(isAuthenticated);
router.get("/me", getCurrentUser);
router.get("/profile", getProfile);
router.put("/profile", userWriteLimiter, uploadLimiter, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), updateProfile);
router.put("/password", userWriteLimiter, updatePassword);
router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId/read", userWriteLimiter, markNotificationRead);
router.put("/notifications/read-all", userWriteLimiter, markAllNotificationsRead);
router.delete("/notifications/:notificationId", userWriteLimiter, deleteNotification);
router.post("/achievements", userWriteLimiter, addAchievement);

export default router;
