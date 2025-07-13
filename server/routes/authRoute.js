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
} from "../controllers/authController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/:userId", getUserProfile);

// Protected routes
router.use(isAuthenticated);
router.get("/me", getCurrentUser);
router.get("/profile", getProfile);
router.put("/profile",upload.single("avatar"), updateProfile);
router.put("/password", updatePassword);
router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId", markNotificationRead);
router.post("/achievements", addAchievement);

export default router;
