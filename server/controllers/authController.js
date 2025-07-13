import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import fs from "fs/promises";
import validator from "validator";
import { resolve } from "path";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
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
    const cookieOptionsLogout = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

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
        sportsPreferences: user.sportsPreferences,
        location: user.location,
        socialLinks: user.socialLinks,
        notifications: user.notifications,
        achievements: user.achievements,
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
        updates[key] = value; // Fallback to original value if not JSON
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
    if (updateFields.length === 0 && !req.file) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    // Handle avatar upload
    let tempAvatar = null;
    if (req.file) {
      try {
        const { secure_url, public_id } = await uploadImage(req.file.path);
        tempAvatar = { url: secure_url, public_id };
        // Delete temporary file
        await fs.unlink(req.file.path).catch((err) => console.error("Failed to delete temp file:", err));
      } catch (error) {
        // Clean up temp file on upload failure
        if (req.file.path) await fs.unlink(req.file.path).catch((err) => console.error("Failed to delete temp file:", err));
        return res.status(500).json({ message: "Error uploading avatar", error: error.message });
      }
    }

    // Apply updates
    updateFields.forEach((field) => {
      user[field] = updates[field];
    });

    // Update avatar only if upload was successful
    if (tempAvatar) {
      const oldPublicId = user.avatar?.public_id;
      user.avatar = tempAvatar;
      // Delete old avatar after setting new one
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) => console.error("Failed to delete old avatar:", err));
      }
    }

    // Save user
    await user.save();

    res.json({
      success: true,
      data: user.getProfile(), // Assuming getProfile() returns a sanitized user object
    });
  } catch (error) {
    // Clean up temp file on general error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch((err) => console.error("Failed to delete temp file:", err));
    }
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
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
