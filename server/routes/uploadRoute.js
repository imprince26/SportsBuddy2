import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Handle event image uploads
router.post(
  '/event',
  isAuthenticated,
  upload.array('eventImages', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const fileUrls = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      res.status(200).json({
        success: true,
        fileUrls,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message,
      });
    }
  }
);

// Handle avatar uploads
router.post(
  '/avatar',
  isAuthenticated,
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Update user's avatar
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old avatar from Cloudinary if it exists
      if (user.avatar && user.avatar.includes('cloudinary')) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }

      user.avatar = req.file.path;
      await user.save();

      res.status(200).json({
        success: true,
        fileUrl: {
          url: req.file.path,
          public_id: req.file.filename,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading avatar',
        error: error.message,
      });
    }
  }
);

export default router;