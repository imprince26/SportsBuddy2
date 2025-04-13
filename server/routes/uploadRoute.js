import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Handle event image uploads
router.post("/event", isAuthenticated, upload.array("eventImages", 5), (req, res) => {
  try {
    const fileUrls = req.files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/events/${file.filename}`
    );
    res.status(200).json({
      success: true,
      fileUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading files",
      error: error.message,
    });
  }
});

// Handle avatar uploads
router.post("/avatar", isAuthenticated, upload.single("avatar"), (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
    res.status(200).json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading avatar",
      error: error.message,
    });
  }
});

export default router;