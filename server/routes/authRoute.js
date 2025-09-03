import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
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
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/:userId", getUserProfile);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);


// Protected routes
router.use(isAuthenticated);
router.get("/me", getCurrentUser);
router.get("/profile", getProfile);
router.put("/profile", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), updateProfile);
router.put("/password", updatePassword);
router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId/read", markNotificationRead);
router.put("/notifications/read-all", markAllNotificationsRead);
router.delete("/notifications/:notificationId", deleteNotification);
router.post("/achievements", addAchievement);

export default router;
