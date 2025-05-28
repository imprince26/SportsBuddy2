import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["event", "chat", "team", "system"],
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar:{
        url: {
          type: String,
        },
        public_id: {
          type: String,
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
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      },
    ],
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
    stats: {
      eventsCreated: {
        type: Number,
        default: 0,
      },
      eventsParticipated: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
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
  this.notifications.unshift(notification);
  await this.save();
};

// Mark notification as read
userSchema.methods.markNotificationAsRead = async function (notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.read = true;
    await this.save();
  }
};

// Mark all notifications as read
userSchema.methods.markAllNotificationsAsRead = async function () {
  this.notifications.forEach((notification) => {
    notification.read = true;
  });
  await this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
