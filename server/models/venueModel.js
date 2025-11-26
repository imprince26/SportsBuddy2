import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
      maxlength: [100, "Venue name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Venue description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
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
      country: {
        type: String,
        required: [true, "Country is required"],
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
    sports: [{
      type: String,
      enum: ["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Hockey", "Athletics", "Badminton", "Gymnastics", "Other"],
    }],
    amenities: [{
      name: String,
      available: { type: Boolean, default: true },
    }],
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
      max: [150000, "Capacity cannot exceed 150000"],
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
      caption: String,
    }],
    pricing: {
      hourlyRate: {
        type: Number,
        min: [0, "Hourly rate cannot be negative"],
        default: 0,
      },
      dayRate: {
        type: Number,
        min: [0, "Day rate cannot be negative"],
        default: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    availability: [{
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      openTime: String,
      closeTime: String,
      isOpen: { type: Boolean, default: true },
    }],
    ratings: [{
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
    }],
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    eventsHosted: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    }],
    bookings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      startTime: Date,
      endTime: Date,
      status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
      },
      amount: Number,
      totalAmount: Number,
      duration: Number, // in hours
      notes: String,
      bookingDate: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create geospatial index
venueSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for average rating
venueSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for total bookings
venueSchema.virtual("totalBookings").get(function () {
  return this.bookings.length;
});

export default mongoose.model("Venue", venueSchema);