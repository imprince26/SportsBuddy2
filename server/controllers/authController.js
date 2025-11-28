import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import fs from "fs/promises";
import validator from "validator";
import sendEmail from "../config/sendEmail.js";
import { welcomeEmailHtml, resetPasswordEmailHtml, passwordResetSuccessEmailHtml } from "../utils/emailTemplate.js";
import { ifError } from "assert";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = await User.create({
      name,
      username,
      email,
      password
    });

    const token = generateToken(newUser);

    res.cookie("SportsBuddyToken", token, cookieOptions);

    // Send welcome email
    // await sendEmail({
    //   from:`Team SportsBuddy <${process.env.FROM_EMAIL}>`,
    //   to: newUser.email,
    //   subject: "Welcome to SportsBuddy!",
    //   html: welcomeEmailHtml(name),
    // });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("SportsBuddyToken", token, cookieOptions);

    // Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

export const logout = (req, res) => {
  try {

    res.clearCookie("SportsBuddyToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.user._id).select({
      password: 0,
      __v: 0,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coverImage: user.coverImage,
        sportsPreferences: user.sportsPreferences,
        location: user.location,
        socialLinks: user.socialLinks,
        notifications: user.notifications,
        achievements: user.achievements,
        stats: user.stats,
        preferences: user.preferences,
        followers: user.followers,
        following: user.following,
        activityLog: user.activityLog
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("participatedEvents")
      .populate("createdEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      data: user.getProfile(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  let oldAvatarPublicId = null;
  let oldCoverImagePublicId = null;
  let newAvatarPublicId = null;
  let newCoverImagePublicId = null;

  try {
    // Extract data from FormData
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      try {
        // Parse JSON-stringified fields
        updates[key] = value && typeof value === "string" && (value.startsWith("{") || value.startsWith("["))
          ? JSON.parse(value)
          : value;
      } catch (error) {
        updates[key] = value;
      }
    }

    // Prevent password update through this route
    delete updates.password;

    // Validate allowed fields
    const allowedUpdates = [
      "name",
      "username",
      "email",
      "bio",
      "location",
      "socialLinks",
      "sportsPreferences",
    ];

    const updateFields = Object.keys(updates).filter((key) => allowedUpdates.includes(key));
    if (updateFields.length === 0 && !req.files?.avatar && !req.files?.coverImage) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store old image public IDs for cleanup
    oldAvatarPublicId = user.avatar?.public_id;
    oldCoverImagePublicId = user.coverImage?.public_id;

    // Validate fields
    if (updates.username) {
      if (updates.username.length < 3 || updates.username.length > 30) {
        return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
      }
      const existingUser = await User.findOne({ username: updates.username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    if (updates.email && !validator.isEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (updates.bio && updates.bio.length > 500) {
      return res.status(400).json({ message: "Bio cannot exceed 500 characters" });
    }

    if (updates.sportsPreferences) {
      if (!Array.isArray(updates.sportsPreferences)) {
        return res.status(400).json({ message: "Sports preferences must be an array" });
      }
      const validSports = ["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"];
      const validLevels = ["Beginner", "Intermediate", "Advanced"];
      for (const sport of updates.sportsPreferences) {
        if (!validSports.includes(sport.sport) || !validLevels.includes(sport.skillLevel)) {
          return res.status(400).json({ message: "Invalid sport or skill level" });
        }
      }
    }

    // Handle avatar - file is already uploaded to Cloudinary by multer
    if (req.files?.avatar && req.files.avatar[0]) {
      const avatarFile = req.files.avatar[0];
      newAvatarPublicId = avatarFile.filename; // Store for cleanup if save fails
      user.avatar = {
        url: avatarFile.path,
        public_id: avatarFile.filename
      };
    }

    // Handle cover image - file is already uploaded to Cloudinary by multer
    if (req.files?.coverImage && req.files.coverImage[0]) {
      const coverImageFile = req.files.coverImage[0];
      newCoverImagePublicId = coverImageFile.filename; // Store for cleanup if save fails
      user.coverImage = {
        url: coverImageFile.path,
        public_id: coverImageFile.filename
      };
    }

    // Apply field updates
    updateFields.forEach((field) => {
      user[field] = updates[field];
    });

    // Save user (this is where it might fail)
    await user.save();

    // Only delete old images after successful save
    if (req.files?.avatar && oldAvatarPublicId) {
      await deleteImage(oldAvatarPublicId).catch((err) => console.error("Failed to delete old avatar:", err));
    }

    if (req.files?.coverImage && oldCoverImagePublicId) {
      await deleteImage(oldCoverImagePublicId).catch((err) => console.error("Failed to delete old cover image:", err));
    }

    res.json({
      success: true,
      data: user.getProfile(),
    });

  } catch (error) {
    console.error("Update profile error:", error);

    // Clean up newly uploaded images on Cloudinary if save failed
    if (newAvatarPublicId) {
      await deleteImage(newAvatarPublicId).catch((err) => console.error("Failed to cleanup uploaded avatar:", err));
    }
    if (newCoverImagePublicId) {
      await deleteImage(newCoverImagePublicId).catch((err) => console.error("Failed to cleanup uploaded cover image:", err));
    }

    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
    console.log(error)
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
};

// Forgot Password - Send Reset Code
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Check if user is currently blocked
    if (user.resetPasswordBlockedUntil && user.resetPasswordBlockedUntil > Date.now()) {
      const blockedMinutes = Math.ceil((user.resetPasswordBlockedUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({
        success: false,
        message: `Too many reset attempts. Please try again in ${blockedMinutes} minutes.`
      });
    }

    // Generate reset code
    const resetCode = user.generateResetPasswordCode();
    await user.save({ validateBeforeSave: false });

    try {
      // Send reset code email
      await sendEmail({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: user.email,
        subject: "Password Reset Code - SportsBuddy",
        html: resetPasswordEmailHtml({
          name: user.name,
          resetCode: resetCode
        }),
      });

      res.status(200).json({
        success: true,
        message: "Password reset code sent to your email",
        data: {
          email: user.email,
          expiresIn: "10 minutes"
        }
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);

      // Clear reset fields if email fails
      user.clearResetPassword();
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset code. Please try again."
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: error.message
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or reset code"
      });
    }

    try {
      // Verify the reset code
      user.verifyResetCode(resetCode);

      // Generate a temporary token for password reset
      const resetToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          purpose: 'password-reset',
          codeVerified: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        message: "Reset code verified successfully",
        data: {
          resetToken,
          expiresIn: "15 minutes"
        }
      });

    } catch (verificationError) {
      // Save any changes to attempts/blocking
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: verificationError.message
      });
    }

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: error.message
    });
  }
};

// Reset Password with Token
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

      if (decoded.purpose !== 'password-reset' || !decoded.codeVerified) {
        throw new Error('Invalid token purpose');
      }
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.clearResetPassword();
    await user.save();

    try {
      // Send confirmation email
      await sendEmail({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: user.email,
        subject: "Password Reset Successful - SportsBuddy",
        html: passwordResetSuccessEmailHtml({
          name: user.name
        }),
      });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: error.message
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("notifications")
      .sort({ "notifications.createdAt": -1 });

    res.json({
      success: true,
      data: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "notifications._id": notificationId,
      },
      {
        $set: {
          "notifications.$.read": true,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $set: {
          notifications: [],
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notifications",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "notifications._id": notificationId,
      },
      {
        $pull: {
          notifications: {
            _id: notificationId,
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

export const addAchievement = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.achievements.push(req.body);
    await user.save();

    res.json({
      success: true,
      data: user.achievements,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding achievement",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("participatedEvents")
      .populate("createdEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user.getProfile(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};
