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
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: [0, 0]
        }
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["confirmed", "pending", "cancelled"],
        default: "confirmed"
      }
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
      default: 0
    },
    images: [{
      url: String,
      caption: String
    }],
    teams: [{
      name: String,
      members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }],
      captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    chat: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    eventType: {
      type: String,
      enum: ["casual", "tournament", "training", "competition"],
      default: "casual"
    },
    rules: [String],
    equipment: [{
      item: String,
      required: Boolean
    }],
    weather: {
      condition: String,
      temperature: Number,
      updated: Date
    },
    images: [
      {
        type: String,
        validate: {
          validator: function(url) {
            // Basic URL validation
            return /^https?:\/\//.test(url);
          },
          message: "Invalid image URL"
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for geospatial queries
eventSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for calculating average rating
eventSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.participants.length >= this.maxParticipants;
};

// Method to check if user is participant
eventSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Update event status based on date
eventSchema.pre('save', function(next) {
  const now = new Date();
  if (this.date < now) {
    this.status = 'Completed';
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
