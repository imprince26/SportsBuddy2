import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["overall", "Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Badminton"],
      default: "overall",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    eventsParticipated: {
      type: Number,
      default: 0,
    },
    eventsCreated: {
      type: Number,
      default: 0,
    },
    eventsWon: {
      type: Number,
      default: 0,
    },
    eventsRated: {
      type: Number,
      default: 0,
    },
    communitiesJoined: {
      type: Number,
      default: 0,
    },
    postsCreated: {
      type: Number,
      default: 0,
    },
    postsLiked: {
      type: Number,
      default: 0,
    },
    commentsCreated: {
      type: Number,
      default: 0,
    },
    venuesRated: {
      type: Number,
      default: 0,
    },
    venuesBooked: {
      type: Number,
      default: 0,
    },
    achievements: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
      points: Number,
      badge: String,
    }],
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastActivity: Date,
    },
    monthlyStats: [{
      month: String,
      year: Number,
      points: Number,
      eventsParticipated: Number,
      eventsCreated: Number,
    }],
    rank: {
      overall: Number,
      category: Number,
    },
    level: {
      current: {
        type: Number,
        default: 1,
      },
      experience: {
        type: Number,
        default: 0,
      },
      nextLevelExp: {
        type: Number,
        default: 100,
      },
    },
    pointsHistory: [{
      points: Number,
      reason: String,
      action: String,
      date: {
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

// Compound index for efficient querying
leaderboardSchema.index({ category: 1, points: -1 });
leaderboardSchema.index({ user: 1, category: 1 });

// Virtual for completion percentage to next level
leaderboardSchema.virtual("levelProgress").get(function () {
  return Math.round((this.level.experience / this.level.nextLevelExp) * 100);
});

export default mongoose.model("Leaderboard", leaderboardSchema);