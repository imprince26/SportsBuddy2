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
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

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
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
