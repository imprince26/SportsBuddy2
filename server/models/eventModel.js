import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      minlength: [3, "Event name must be at least 3 characters"],
      maxlength: [100, "Event name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: {
        values: [
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
        message: "Invalid event category",
      },
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      validate: {
        validator: function (value) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: "Invalid time format. Use HH:MM",
      },
    },
    location: {
      address: {
        type: String,
        required: [true, "Location address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Venue relationship
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      default: null
    },

    // Community relationship
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["confirmed", "pending", "cancelled"],
          default: "confirmed",
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "confirmed"],
          default: "confirmed"
        },
        paymentMethod: {
          type: String,
          enum: ["cash", "online", "free"],
          default: "free"
        },
        paidAt: {
          type: Date
        },
        checkInTime: Date,
        checkOutTime: Date,
        attended: { type: Boolean, default: false },
        rating: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
          createdAt: { type: Date, default: Date.now }
        }
      },
    ],
    waitlist: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      joinedWaitlistAt: {
        type: Date,
        default: Date.now,
      },
      position: Number
    }],
    maxParticipants: {
      type: Number,
      default: 10,
      min: [1, "Minimum participants must be 1"],
      max: [1000, "Maximum participants cannot exceed 1000"],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced"],
        message: "Invalid difficulty level",
      },
      default: "Beginner",
    },
    status: {
      type: String,
      enum: {
        values: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
        message: "Invalid event status",
      },
      default: "Upcoming",
    },
    registrationFee: {
      type: Number,
      min: [0, "Registration fee cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          validate: {
            validator: function (url) {
              return /^https?:\/\//.test(url);
            },
            message: "Invalid image URL",
          },
        },
        public_id: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
      },
    ],
    teams: [
      {
        name: String,
        members: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        captain: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    chat: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    eventType: {
      type: String,
      enum: ["casual", "tournament", "training", "competition"],
      default: "casual",
    },
    rules: [String],
    equipment: [
      {
        item: String,
        required: Boolean,
      },
    ],
    weather: {
      condition: String,
      temperature: Number,
      updated: Date,
    },
    // Social features
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      likedAt: {
        type: Date,
        default: Date.now,
      }
    }],

    // Enhanced analytics
    analytics: {
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 }
    },

    // Feature flags
    features: {
      allowWaitlist: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      allowRatings: { type: Boolean, default: true },
      enableChat: { type: Boolean, default: true },
      trackAttendance: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries
eventSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for calculating average rating
eventSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for participant count
eventSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Method to check if event is full
eventSchema.methods.isFull = function () {
  return this.participants.length >= this.maxParticipants;
};

// Method to check if user is participant
eventSchema.methods.isParticipant = function (userId) {
  return this.participants.some((p) => p.user.toString() === userId.toString());
};

eventSchema.methods.notifyParticipants = async function (notification) {
  const User = mongoose.model("User");

  if (this.participants && this.participants.length > 0) {
    const participantIds = this.participants.map(p => p.user);

    // Add notification to each participant
    await User.updateMany(
      { _id: { $in: participantIds } },
      {
        $push: {
          notifications: {
            $each: [{
              type: "event",
              title: notification.title || `Event Update: ${this.name}`,
              message: notification.message,
              relatedEvent: this._id,
              priority: notification.priority || "normal",
              timestamp: new Date()
            }],
            $position: 0
          }
        }
      }
    );
  }
};

eventSchema.methods.addToWaitlist = async function (userId) {
  const position = this.waitlist.length + 1;
  this.waitlist.push({
    user: userId,
    position: position
  });
  await this.save();
  return position;
};

eventSchema.methods.promoteFromWaitlist = async function () {
  if (this.waitlist.length > 0 && !this.isFull()) {
    const nextUser = this.waitlist.shift();
    this.participants.push({
      user: nextUser.user,
      status: "confirmed"
    });

    // Update positions for remaining waitlist
    this.waitlist.forEach((item, index) => {
      item.position = index + 1;
    });

    await this.save();
    return nextUser;
  }
  return null;
};

eventSchema.methods.updateAnalytics = async function () {
  // Calculate average rating
  const ratings = this.participants
    .filter(p => p.rating && p.rating.score)
    .map(p => p.rating.score);

  if (ratings.length > 0) {
    this.analytics.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  // Calculate completion rate
  const attendedCount = this.participants.filter(p => p.attended).length;
  if (this.participants.length > 0) {
    this.analytics.completionRate = (attendedCount / this.participants.length) * 100;
  }

  await this.save();
};

// Update event status based on date
eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.date < now) {
    this.status = "Completed";
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
