import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { type } from "os";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["event", "chat", "team", "system", "announcement", "marketing", "follow"],
  },
  message: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  relatedCommunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  relatedVenue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  achievementData: {
    title: String,
    icon: String,
    points: Number
  },
  relatedNotification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high"],
    default: "normal",
  },
  actionUrl: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    resetPasswordCode: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    resetPasswordBlockedUntil: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    coverImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String
      },
    },
    sportsPreferences: [
      {
        sport: {
          type: String,
          enum: [
            "Football",
            "Basketball",
            "Tennis",
            "Running",
            "Cycling",
            "Swimming",
            "Volleyball",
            "Cricket",
            "Other",
          ],
        },
        skillLevel: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
      },
    ],
    // achievements: [
    //   {
    //     title: String,
    //     description: String,
    //     date: Date,
    //     eventId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Event",
    //     },
    //   },
    // ],
    achievements: [{
      title: String,
      description: String,
      icon: String,
      category: String,
      earnedAt: { type: Date, default: Date.now },
      points: { type: Number, default: 0 }
    }],
    location: {
      city: String,
      state: String,
      country: String,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    notifications: [notificationSchema],
    participatedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    createdEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      radius: {
        type: Number,
        default: 10, // radius in kilometers
      },
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favoriteVenues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
    }],

    stats: {
      eventsCreated: { type: Number, default: 0 },
      eventsParticipated: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      currentRank: { type: Number, default: 0 },
      achievementsCount: { type: Number, default: 0 },
      communitiesJoined: { type: Number, default: 0 },
      postsCreated: { type: Number, default: 0 },
    },
    activityLog: [{
      action: {
        type: String,
        enum: ["event_join", "event_create", "post_create", "venue_review", "achievement_earned"]
      },
      points: Number,
      category: String,
      relatedId: mongoose.Schema.Types.ObjectId,
      timestamp: { type: Date, default: Date.now }
    }],

    // Community preferences
    communityPreferences: {
      autoJoinLocalCommunities: { type: Boolean, default: false },
      allowCommunityInvites: { type: Boolean, default: true },
      showInMembersList: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {

  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user profile (excluding sensitive information)
userSchema.methods.getProfile = function () {
  const profile = this.toObject();
  delete profile.password;
  delete profile.__v;
  return profile;
};

// Update user stats
userSchema.methods.updateStats = async function () {
  const Event = mongoose.model("Event");

  const eventsCreated = await Event.countDocuments({ createdBy: this._id });
  const eventsParticipated = await Event.countDocuments({
    "participants.user": this._id,
  });

  this.stats.eventsCreated = eventsCreated;
  this.stats.eventsParticipated = eventsParticipated;

  await this.save();
};

// Add notification method
userSchema.methods.addNotification = async function (notification) {
  try {
    // Limit notifications to prevent memory issues
    if (this.notifications.length >= 100) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifications.unshift(notification);
    await this.save();
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Add method to create notification from bulk notification
userSchema.methods.addBulkNotification = async function (bulkNotification) {
  const notification = {
    type: bulkNotification.type === 'announcement' ? 'system' : bulkNotification.type,
    title: bulkNotification.title,
    message: bulkNotification.message,
    relatedNotification: bulkNotification._id,
    priority: bulkNotification.priority,
    actionUrl: bulkNotification.metadata?.actionUrl,
    timestamp: new Date()
  };

  await this.addNotification(notification);
};

// Get unread notification count
userSchema.methods.getUnreadNotificationCount = function () {
  return this.notifications.filter(notification => !notification.read).length;
};

// Mark notification as read
userSchema.methods.markNotificationAsRead = async function (notificationId) {
  try {
    const notification = this.notifications.id(notificationId);
    if (notification) {
      notification.read = true;
      await this.save();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
userSchema.methods.markAllNotificationsAsRead = async function () {
  try {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    await this.save();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Method to generate reset password code
userSchema.methods.generateResetPasswordCode = function () {
  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the code before saving
  this.resetPasswordCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Reset attempts if not blocked
  if (!this.resetPasswordBlockedUntil || this.resetPasswordBlockedUntil < Date.now()) {
    this.resetPasswordAttempts = 0;
    this.resetPasswordBlockedUntil = undefined;
  }

  return resetCode;
};

// Method to verify reset code
userSchema.methods.verifyResetCode = function (enteredCode) {
  // Check if user is blocked
  if (this.resetPasswordBlockedUntil && this.resetPasswordBlockedUntil > Date.now()) {
    const blockedMinutes = Math.ceil((this.resetPasswordBlockedUntil - Date.now()) / (1000 * 60));
    throw new Error(`Too many failed attempts. Try again in ${blockedMinutes} minutes.`);
  }

  // Check if code has expired
  if (!this.resetPasswordExpire || this.resetPasswordExpire < Date.now()) {
    throw new Error('Reset code has expired');
  }

  // Hash the entered code and compare
  const hashedCode = crypto.createHash('sha256').update(enteredCode).digest('hex');

  if (hashedCode !== this.resetPasswordCode) {
    // Increment attempts
    this.resetPasswordAttempts += 1;

    // Block user after 5 failed attempts for 30 minutes
    if (this.resetPasswordAttempts >= 5) {
      this.resetPasswordBlockedUntil = Date.now() + 30 * 60 * 1000;
      throw new Error('Too many failed attempts. Account temporarily blocked for 30 minutes.');
    }

    throw new Error(`Invalid reset code. ${5 - this.resetPasswordAttempts} attempts remaining.`);
  }

  return true;
};

// Method to clear reset password fields
userSchema.methods.clearResetPassword = function () {
  this.resetPasswordCode = undefined;
  this.resetPasswordExpire = undefined;
  this.resetPasswordAttempts = 0;
  this.resetPasswordBlockedUntil = undefined;
};

const User = mongoose.model("User", userSchema);

export default User;
