import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      trim: true,
      maxlength: [100, "Community name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Community description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Community category is required"],
      enum: ["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "General", "Other"],
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    image: {
      url: String,
      public_id: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      role: {
        type: String,
        enum: ["member", "moderator", "admin"],
        default: "member",
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    posts: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      images: [{
        url: String,
        public_id: String,
      }],
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      comments: [{
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        likes: [{
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        }],
        replies: [{
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          content: {
            type: String,
            required: true,
            maxlength: 500,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          likes: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          }],
        }],
      }],
      views: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      }],
      shares: {
        type: Number,
        default: 0,
      },
      isPinned: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    rules: [String],
    events: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    joinRequests: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    }],
    settings: {
      allowMemberPosts: {
        type: Boolean,
        default: true,
      },
      allowMemberEvents: {
        type: Boolean,
        default: true,
      },
      autoApproveMembers: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalEvents: {
        type: Number,
        default: 0,
      },
      monthlyActiveMembers: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for member count
communitySchema.virtual("memberCount").get(function () {
  return this.members.filter(member => member.isActive).length;
});

// Virtual for recent activity
communitySchema.virtual("recentActivity").get(function () {
  if (!this.posts || !Array.isArray(this.posts)) {
    return [];
  }
  const recentPosts = this.posts
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  return recentPosts;
});

export default mongoose.model("Community", communitySchema);