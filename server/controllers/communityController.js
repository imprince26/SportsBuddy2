import Community from '../models/communityModel.js';
import User from '../models/userModel.js';
import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import { completeUserAction, POINT_VALUES } from '../utils/userStatsHelper.js';

// Get all communities
export const getCommunities = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      sortBy = "members:desc",
      page = 1,
      limit = 12
    } = req.query;

    // Validate and sanitize numeric parameters
    const validLimit = parseInt(limit) || 12;
    const validPage = parseInt(page) || 1;

    const query = { isActive: true };

    // Search filter
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const [sortField, sortOrder] = sortBy.split(":");
    let sort = {};

    switch (sortField) {
      case "name":
        sort.name = sortOrder === "desc" ? -1 : 1;
        break;
      case "created":
        sort.createdAt = sortOrder === "desc" ? -1 : 1;
        break;
      case "members":
        // Handle in aggregation
        break;
      default:
        sort.createdAt = -1;
    }

    let communities, total;

    if (sortField === "members") {
      // Use aggregation for member count sorting
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            memberCount: {
              $size: {
                $filter: {
                  input: "$members",
                  cond: { $eq: ["$$this.isActive", true] }
                }
              }
            },
            recentActivityCount: {
              $size: {
                $filter: {
                  input: "$posts",
                  cond: {
                    $gte: [
                      "$$this.createdAt",
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { memberCount: sortOrder === "desc" ? -1 : 1 } },
        { $skip: skip },
        { $limit: validLimit }
      ];

      communities = await Community.aggregate([
        ...pipeline,
        {
          $lookup: {
            from: "users",
            localField: "creator",
            foreignField: "_id",
            as: "creator",
            pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
          }
        },
        { $unwind: "$creator" },
        {
          $project: {
            password: 0,
            joinRequests: 0,
            "members.user": 0
          }
        }
      ]);

      total = await Community.countDocuments(query);
    } else {
      communities = await Community.find(query)
        .sort(sort)
        .skip(skip)
        .limit(validLimit)
        .populate("creator", "name avatar username")
        .select("-joinRequests -members.user")
        .lean();

      // Add member count
      communities = communities.map(community => ({
        ...community,
        memberCount: community.members.filter(m => m.isActive).length
      }));

      total = await Community.countDocuments(query);
    }

    res.json({
      success: true,
      data: communities,
      pagination: {
        currentPage: validPage,
        totalPages: Math.ceil(total / validLimit),
        total,
        hasNext: validPage < Math.ceil(total / validLimit),
        hasPrev: validPage > 1,
        limit: validLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching communities",
      error: error.message
    });
  }
};

// Get single community
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("creator", "name avatar username")
      .populate("admins", "name avatar username")
      .populate("moderators", "name avatar username")
      .populate("members.user", "name avatar username location.city")
      .populate("posts.author", "name avatar username")
      .populate("posts.comments.author", "name avatar username")
      .populate("posts.comments.replies.author", "name avatar username")
      .populate("events")
      .lean();

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is member
    const isMember = req.user && community.members.some(
      member => member.user._id.toString() === req.user.id && member.isActive
    );

    // Get member role
    const memberRole = isMember
      ? community.members.find(m => m.user._id.toString() === req.user.id)?.role
      : null;

    // Check if user can manage community
    const isCreator = req.user && community.creator._id.toString() === req.user.id;
    const isAdmin = req.user && community.admins?.some(a => a._id.toString() === req.user.id);
    const isModerator = req.user && community.moderators?.some(m => m._id.toString() === req.user.id);
    const canManage = isCreator || isAdmin || isModerator;

    // Filter posts based on privacy and membership
    let visiblePosts = community.posts;
    if (community.isPrivate && !isMember) {
      visiblePosts = [];
    }

    // Sort posts (pinned first, then by date)
    visiblePosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      data: {
        ...community,
        posts: visiblePosts.slice(0, 20),
        memberCount: community.members.filter(m => m.isActive).length,
        isMember,
        memberRole,
        isCreator,
        canManage,
        canPost: isMember && (community.settings.allowMemberPosts || memberRole !== "member")
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching community",
      error: error.message
    });
  }
};

// Create community
export const createCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      location,
      rules,
      isPrivate,
      settings
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Community name is required"
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Community description is required"
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Community category is required"
      });
    }

    let uploadedImage = null;

    // Handle image upload
    if (req.files && req.files.length > 0) {
      try {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "communities",
          transformation: [
            { width: 800, height: 600, crop: "fill", quality: "auto" },
            { fetch_format: "auto" }
          ]
        });

        uploadedImage = {
          url: result.secure_url,
          public_id: result.public_id
        };
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    const community = new Community({
      name: name.trim(),
      description: description.trim(),
      category,
      location: typeof location === "string" ? JSON.parse(location) : location,
      rules: Array.isArray(rules) ? rules : JSON.parse(rules || "[]"),
      isPrivate: isPrivate === "true" || isPrivate === true,
      settings: typeof settings === "string" ? JSON.parse(settings) : settings,
      image: uploadedImage,
      creator: req.user.id,
      admins: [req.user.id],
      members: [{
        user: req.user.id,
        role: "admin",
        joinedAt: new Date()
      }]
    });

    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate("creator", "name avatar username")
      .populate("members.user", "name avatar username");

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: populatedCommunity
    });
  } catch (error) {
    console.error("Error creating community:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error creating community"
    });
  }
};

// Update community
export const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      location,
      rules,
      isPrivate,
      settings,
      removeImage
    } = req.body;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check permissions
    const isAdmin = community.admins.includes(req.user.id) ||
      community.creator.toString() === req.user.id;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only community admins can update community details"
      });
    }

    // Check if new name conflicts with existing communities
    if (name && name !== community.name) {
      const existingCommunity = await Community.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCommunity) {
        return res.status(400).json({
          success: false,
          message: "A community with this name already exists"
        });
      }
    }

    // Handle image removal
    if (removeImage === "true" && community.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(community.image.public_id);
        community.image = null;
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError);
      }
    }

    // Handle new image upload
    if (req.files && req.files.length > 0) {
      try {
        // Delete old image if exists
        if (community.image?.public_id) {
          try {
            await cloudinary.uploader.destroy(community.image.public_id);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        const file = req.files[0];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "communities",
          transformation: [
            { width: 800, height: 600, crop: "fill", quality: "auto" },
            { fetch_format: "auto" }
          ],
          resource_type: "auto"
        });

        community.image = {
          url: result.secure_url,
          public_id: result.public_id
        };

        // Delete temporary file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed: " + uploadError.message
        });
      }
    }

    // Update fields
    if (name) community.name = name.trim();
    if (description) community.description = description.trim();
    if (category) community.category = category;
    if (location) {
      community.location = typeof location === "string" ? JSON.parse(location) : location;
    }
    if (rules) {
      community.rules = Array.isArray(rules) ? rules : JSON.parse(rules);
    }
    if (isPrivate !== undefined) {
      community.isPrivate = isPrivate === "true" || isPrivate === true;
    }
    if (settings) {
      const parsedSettings = typeof settings === "string" ? JSON.parse(settings) : settings;
      community.settings = { ...community.settings, ...parsedSettings };
    }

    community.updatedAt = new Date();

    await community.save();

    // Populate updated community
    const updatedCommunity = await Community.findById(id)
      .populate("creator", "name avatar username")
      .populate("admins", "name avatar username")
      .populate("moderators", "name avatar username")
      .select("-joinRequests -posts");

    res.json({
      success: true,
      message: "Community updated successfully",
      data: updatedCommunity
    });

  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).json({
      success: false,
      message: "Error updating community",
      error: error.message
    });
  }
};

// Delete community
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmDelete } = req.body;

    if (!confirmDelete) {
      return res.status(400).json({
        success: false,
        message: "Confirmation required to delete community"
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check permissions - only creator can delete
    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the community creator can delete the community"
      });
    }

    // Delete community image from cloudinary
    if (community.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(community.image.public_id);
      } catch (deleteError) {
        console.error("Error deleting community image:", deleteError);
      }
    }

    // Delete all post images
    if (community.posts && community.posts.length > 0) {
      try {
        const imageDeletePromises = [];

        community.posts.forEach(post => {
          if (post.images && post.images.length > 0) {
            post.images.forEach(img => {
              if (img.public_id) {
                imageDeletePromises.push(
                  cloudinary.uploader.destroy(img.public_id)
                );
              }
            });
          }
        });

        if (imageDeletePromises.length > 0) {
          await Promise.all(imageDeletePromises);
        }
      } catch (deleteError) {
        console.error("Error deleting post images:", deleteError);
      }
    }

    // Soft delete - mark as inactive instead of actual deletion
    community.isActive = false;
    community.deletedAt = new Date();
    community.deletedBy = req.user.id;
    await community.save();

    // For hard delete, uncomment below:
    // await Community.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Community deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting community",
      error: error.message
    });
  }
};

// Get user's communities
export const getUserCommunities = async (req, res) => {
  try {
    const { role = "all", page = 1, limit = 12 } = req.query;
    const userId = req.params.userId || req.user.id;

    const validPage = parseInt(page) || 1;
    const validLimit = parseInt(limit) || 12;
    const skip = (validPage - 1) * validLimit;

    // Get communities where user is a member
    let memberMatchQuery = {
      "members.user": userId,
      "members.isActive": true,
      isActive: true
    };

    // Filter by role
    if (role !== "all") {
      memberMatchQuery["members.role"] = role;
    }

    // Get communities where user is creator
    const creatorMatchQuery = {
      creator: userId,
      isActive: true
    };

    const memberPipeline = [
      {
        $match: memberMatchQuery
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.isActive", true] }
              }
            }
          },
          userRole: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$members",
                  cond: {
                    $and: [
                      { $eq: ["$$this.user", userId] },
                      { $eq: ["$$this.isActive", true] }
                    ]
                  }
                }
              },
              0
            ]
          },
          isCreator: false
        }
      },
      { $sort: { "userRole.joinedAt": -1 } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          location: 1,
          image: 1,
          isPrivate: 1,
          creator: 1,
          memberCount: 1,
          userRole: "$userRole.role",
          joinedAt: "$userRole.joinedAt",
          createdAt: 1,
          stats: 1,
          isCreator: 1
        }
      }
    ];

    const creatorPipeline = [
      {
        $match: creatorMatchQuery
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.isActive", true] }
              }
            }
          },
          userRole: "creator",
          isCreator: true,
          joinedAt: "$createdAt"
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          location: 1,
          image: 1,
          isPrivate: 1,
          creator: 1,
          memberCount: 1,
          userRole: 1,
          joinedAt: 1,
          createdAt: 1,
          stats: 1,
          isCreator: 1
        }
      }
    ];

    // Execute both pipelines
    const [memberCommunities, creatorCommunities] = await Promise.all([
      Community.aggregate(memberPipeline),
      Community.aggregate(creatorPipeline)
    ]);

    // Merge and remove duplicates (user might be both creator and member)
    const allCommunities = [...creatorCommunities, ...memberCommunities];
    const uniqueCommunities = allCommunities.filter((community, index, self) =>
      index === self.findIndex((c) => c._id.toString() === community._id.toString())
    );

    // Apply pagination to merged results
    const paginatedCommunities = uniqueCommunities.slice(skip, skip + validLimit);
    const total = uniqueCommunities.length;

    res.json({
      success: true,
      data: paginatedCommunities,
      pagination: {
        currentPage: validPage,
        totalPages: Math.ceil(total / validLimit),
        total,
        hasNext: validPage < Math.ceil(total / validLimit),
        hasPrev: validPage > 1,
        limit: validLimit
      }
    });

  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user communities",
      error: error.message
    });
  }
};

// Get featured communities
export const getFeaturedCommunities = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredCommunities = await Community.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.isActive", true] }
              }
            }
          },
          recentActivityCount: {
            $size: {
              $filter: {
                input: "$posts",
                cond: {
                  $gte: [
                    "$$this.createdAt",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          featuredScore: {
            $add: [
              { $multiply: ["$memberCount", 2] },
              { $multiply: ["$recentActivityCount", 5] },
              { $multiply: ["$stats.totalPosts", 1] }
            ]
          }
        }
      },
      { $sort: { featuredScore: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [{ $project: { name: 1, avatar: 1, username: 1 } }]
        }
      },
      { $unwind: "$creator" },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          location: 1,
          image: 1,
          isPrivate: 1,
          creator: 1,
          memberCount: 1,
          createdAt: 1,
          stats: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: featuredCommunities
    });

  } catch (error) {
    console.error("Error fetching featured communities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured communities",
      error: error.message
    });
  }
};

// Search communities
export const searchCommunities = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: "Search query must be at least 2 characters"
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const communities = await Community.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { "location.city": searchRegex },
        { "location.state": searchRegex }
      ]
    })
      .populate("creator", "name username avatar")
      .select("name description category location image isPrivate creator stats")
      .limit(parseInt(limit))
      .lean();

    // Add member count
    const communitiesWithCount = communities.map(community => ({
      ...community,
      memberCount: community.members ? community.members.filter(m => m.isActive).length : 0
    }));

    res.json({
      success: true,
      data: communitiesWithCount,
      total: communities.length
    });

  } catch (error) {
    console.error("Error searching communities:", error);
    res.status(500).json({
      success: false,
      message: "Error searching communities",
      error: error.message
    });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is already a member
    const existingMember = community.members.find(
      member => member.user.toString() === req.user.id
    );

    if (existingMember && existingMember.isActive) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community"
      });
    }

    if (community.isPrivate) {
      // Add to join requests if private
      const existingRequest = community.joinRequests.find(
        request => request.user.toString() === req.user.id && request.status === "pending"
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending join request"
        });
      }

      community.joinRequests.push({
        user: req.user.id,
        message: message || "",
        requestedAt: new Date()
      });

      await community.save();

      res.json({
        success: true,
        message: "Join request sent successfully"
      });
    } else {
      // Auto-join if public
      if (existingMember) {
        existingMember.isActive = true;
        existingMember.joinedAt = new Date();
      } else {
        community.members.push({
          user: req.user.id,
          role: "member",
          joinedAt: new Date()
        });
      }

      await community.save();

      // Update user stats: increment communitiesJoined, award points
      try {
        await completeUserAction(req.user.id, {
          action: 'community_join',
          points: POINT_VALUES.COMMUNITY_JOIN,
          category: community.category || 'overall',
          statUpdates: { communitiesJoined: 1 },
          relatedId: communityId,
          checkAchievements: true
        });

        // Add notification to user about joining community
        const user = await User.findById(req.user.id);
        await user.addNotification({
          type: 'community',
          title: 'Community Joined',
          message: `You've joined "${community.name}" and earned ${POINT_VALUES.COMMUNITY_JOIN} points!`,
          relatedCommunity: communityId,
          priority: 'normal'
        });
      } catch (statsError) {
        console.error('Error updating user stats:', statsError);
      }

      res.json({
        success: true,
        message: "Successfully joined the community"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining community",
      error: error.message
    });
    console.log(error)
  }
};

// Leave community
export const leaveCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const memberIndex = community.members.findIndex(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community"
      });
    }

    // Check if user is the creator
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Community creator cannot leave. Transfer ownership first."
      });
    }

    community.members[memberIndex].isActive = false;
    await community.save();

    // Update user stats: decrement communitiesJoined
    try {
      await completeUserAction(req.user.id, {
        action: 'community_leave',
        points: 0,
        category: community.category || 'overall',
        statUpdates: { communitiesJoined: -1 },
        relatedId: communityId,
        checkAchievements: false
      });
    } catch (statsError) {
      console.error('Error updating user stats:', statsError);
    }

    res.json({
      success: true,
      message: "Successfully left the community"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error leaving community",
      error: error.message
    });
  }
};

// Create post in community
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to post in this community"
      });
    }

    // Check permissions
    const memberRole = community.members.find(
      m => m.user.toString() === req.user.id
    )?.role;

    if (!community.settings.allowMemberPosts && memberRole === "member") {
      return res.status(403).json({
        success: false,
        message: "Only admins and moderators can post in this community"
      });
    }

    let uploadedImages = [];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return cloudinary.uploader.upload(file.path, {
            folder: "community-posts",
            transformation: [
              { width: 1200, height: 800, crop: "fill", quality: "auto" },
              { fetch_format: "auto" }
            ]
          });
        });

        const results = await Promise.all(uploadPromises);
        uploadedImages = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
      } catch (uploadError) {
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    const newPost = {
      author: req.user.id,
      content,
      images: uploadedImages,
      likes: [],
      comments: [],
      createdAt: new Date()
    };

    community.posts.push(newPost);
    community.stats.totalPosts += 1;
    await community.save();

    // Update user stats: increment postsCreated, award points
    try {
      await completeUserAction(req.user.id, {
        action: 'post_create',
        points: POINT_VALUES.POST_CREATE,
        category: community.category || 'overall',
        statUpdates: { postsCreated: 1 },
        relatedId: newPost._id,
        checkAchievements: true
      });

      // Add notification to user about post creation
      const user = await User.findById(req.user.id);
      await user.addNotification({
        type: 'community',
        title: 'Post Created',
        message: `Your post in "${community.name}" earned you ${POINT_VALUES.POST_CREATE} points!`,
        relatedCommunity: communityId,
        priority: 'normal'
      });
    } catch (statsError) {
      console.error('Error updating user stats:', statsError);
    }

    // Get the created post with populated author
    const updatedCommunity = await Community.findById(communityId)
      .populate("posts.author", "name avatar username")
      .select("posts");

    const createdPost = updatedCommunity.posts[updatedCommunity.posts.length - 1];

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: createdPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message
    });
  }
};

// Get community posts with filtering and pagination
export const getCommunityPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category = "",
      search = "",
      sortBy = "latest",
      communityId = ""
    } = req.query;

    console.log('getCommunityPosts called with:', { page, limit, category, search, sortBy, communityId });

    let query = {};

    // Filter by community
    if (communityId) {
      query.community = communityId;
    }

    // Search filter
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'latest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { likesCount: -1, createdAt: -1 };
        break;
      case 'comments':
        sort = { commentsCount: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Build query for finding communities
    let communityQuery = {};
    if (communityId) {
      communityQuery._id = communityId;
    }

    // Get posts from communities collection
    const communities = await Community.find(communityQuery)
      .populate({
        path: 'posts.author',
        select: 'name username avatar'
      })
      .populate({
        path: 'posts.comments.author',
        select: 'name username avatar'
      })
      .populate({
        path: 'posts.comments.replies.author',
        select: 'name username avatar'
      });

    console.log('Found communities:', communities.length);
    communities.forEach(c => {
      console.log(`Community ${c.name} has ${c.posts?.length || 0} posts`);
    });

    let allPosts = [];
    communities.forEach(community => {
      community.posts.forEach(post => {
        allPosts.push({
          ...post.toObject(),
          community: {
            _id: community._id,
            name: community.name,
            image: community.image
          },
          likesCount: post.likes.length,
          commentsCount: post.comments.length
        });
      });
    });

    // Filter posts by search and category
    if (search) {
      allPosts = allPosts.filter(post =>
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        (post.tags && post.tags.some(tag =>
          tag.toLowerCase().includes(search.toLowerCase())
        ))
      );
    }

    // Sort posts
    allPosts.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'popular':
          return b.likesCount - a.likesCount || new Date(b.createdAt) - new Date(a.createdAt);
        case 'comments':
          return b.commentsCount - a.commentsCount || new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Pagination
    const total = allPosts.length;
    const paginatedPosts = allPosts.slice(skip, skip + parseInt(limit));

    console.log('Total posts found:', total, 'Returning:', paginatedPosts.length);

    res.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      },
      filters: {
        category: category || 'all',
        search: search || '',
        sortBy: sortBy || 'latest'
      }
    });

  } catch (error) {
    console.error("Error in getCommunityPosts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community posts",
      error: error.message
    });
  }
};

// Create community post
export const createCommunityPost = async (req, res) => {
  try {
    const { content, communityId, tags, category } = req.body;

    if (!content || !communityId) {
      return res.status(400).json({
        success: false,
        message: "Content and community ID are required"
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must be a member to post in this community"
      });
    }

    let uploadedImages = [];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return cloudinary.uploader.upload(file.path, {
            folder: "community-posts",
            transformation: [
              { width: 1200, height: 800, crop: "fill", quality: "auto" },
              { fetch_format: "auto" }
            ]
          });
        });

        const results = await Promise.all(uploadPromises);
        uploadedImages = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
      } catch (uploadError) {
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    const newPost = {
      author: req.user.id,
      content,
      images: uploadedImages,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      category: category || 'general',
      likes: [],
      comments: [],
      createdAt: new Date()
    };

    community.posts.push(newPost);
    community.stats.totalPosts += 1;
    await community.save();

    // Get the created post with populated data
    const updatedCommunity = await Community.findById(communityId)
      .populate("posts.author", "name avatar username")
      .select("posts name image");

    const createdPost = updatedCommunity.posts[updatedCommunity.posts.length - 1];

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        ...createdPost.toObject(),
        community: {
          _id: updatedCommunity._id,
          name: updatedCommunity.name,
          image: updatedCommunity.image
        }
      }
    });

  } catch (error) {
    console.error("Error in createCommunityPost:", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message
    });
  }
};

// Get community post by ID
export const getCommunityPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne(
      { "posts._id": id },
      { "posts.$": 1, name: 1, image: 1 }
    )
      .populate("posts.author", "name username avatar")
      .populate("posts.comments.author", "name username avatar")
      .populate("posts.comments.replies.author", "name username avatar");

    if (!community || !community.posts.length) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts[0];

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        community: {
          _id: community._id,
          name: community.name,
          image: community.image
        },
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        viewsCount: post.views?.length || 0,
        sharesCount: post.shares || 0,
        isLiked: req.user ? post.likes.some(like => like.user?.toString() === req.user.id) : false
      }
    });

  } catch (error) {
    console.error("Error in getCommunityPostById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message
    });
  }
};

// Update community post
export const updateCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags, category } = req.body;

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);

    // Check if user is the author or community admin
    if (post.author.toString() !== req.user.id &&
      !community.admins.includes(req.user.id) &&
      !community.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post"
      });
    }

    // Update post fields
    if (content) post.content = content;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (category) post.category = category;
    post.updatedAt = new Date();

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return cloudinary.uploader.upload(file.path, {
            folder: "community-posts",
            transformation: [
              { width: 1200, height: 800, crop: "fill", quality: "auto" },
              { fetch_format: "auto" }
            ]
          });
        });

        const results = await Promise.all(uploadPromises);
        const newImages = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));

        post.images = [...post.images, ...newImages];
      } catch (uploadError) {
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    await community.save();

    // Return updated post with all populated data
    const updatedCommunity = await Community.findOne({ "posts._id": id })
      .populate("posts.author", "name username avatar")
      .populate("posts.comments.author", "name username avatar")
      .populate("posts.comments.replies.author", "name username avatar")
      .select("posts name image");

    const updatedPost = updatedCommunity.posts.id(id);

    res.json({
      success: true,
      message: "Post updated successfully",
      data: {
        ...updatedPost.toObject(),
        community: {
          _id: updatedCommunity._id,
          name: updatedCommunity.name,
          image: updatedCommunity.image
        },
        likesCount: updatedPost.likes.length,
        commentsCount: updatedPost.comments.length
      }
    });

  } catch (error) {
    console.error("Error in updateCommunityPost:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message
    });
  }
};

// Delete community post
export const deleteCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);

    // Check if user is the author or community admin
    if (post.author.toString() !== req.user.id &&
      !community.admins.includes(req.user.id) &&
      !community.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post"
      });
    }

    // Delete images from cloudinary
    if (post.images && post.images.length > 0) {
      try {
        const deletePromises = post.images.map(img =>
          cloudinary.uploader.destroy(img.public_id)
        );
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error("Error deleting images:", deleteError);
      }
    }

    // Remove post from community
    community.posts.pull(id);
    community.stats.totalPosts -= 1;
    await community.save();

    res.json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteCommunityPost:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message
    });
  }
};

// Like/Unlike community post
export const likeCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);
    const userId = req.user.id;

    // Check if user already liked (using new schema with user object)
    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId);

    if (likeIndex > -1) {
      // Unlike - remove the like
      post.likes.splice(likeIndex, 1);
    } else {
      // Like - add new like
      post.likes.push({ user: userId, createdAt: new Date() });
    }

    await community.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? "Post unliked" : "Post liked",
      data: {
        isLiked: likeIndex === -1,
        likesCount: post.likes.length
      }
    });

  } catch (error) {
    console.error("Error in likeCommunityPost:", error);
    res.status(500).json({
      success: false,
      message: "Error updating like status",
      error: error.message
    });
  }
};

// Add comment to post
export const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);

    const newComment = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await community.save();

    // Get updated post with populated comment
    const updatedCommunity = await Community.findOne({ "posts._id": id })
      .populate("posts.comments.author", "name username avatar")
      .select("posts");

    const updatedPost = updatedCommunity.posts.id(id);
    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: addedComment
    });

  } catch (error) {
    console.error("Error in addCommentToPost:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message
    });
  }
};

// Get community stats
export const getCommunityStats = async (req, res) => {
  try {
    const totalCommunities = await Community.countDocuments({ isActive: true });

    const stats = await Community.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalMembers: {
            $sum: {
              $size: {
                $filter: {
                  input: "$members",
                  cond: { $eq: ["$$this.isActive", true] }
                }
              }
            }
          },
          totalPosts: { $sum: { $size: "$posts" } },
          totalEvents: { $sum: { $size: "$events" } }
        }
      }
    ]);

    const categoryStats = await Community.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalMembers: {
            $sum: {
              $size: {
                $filter: {
                  input: "$members",
                  cond: { $eq: ["$$this.isActive", true] }
                }
              }
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalMembers: 0,
      totalPosts: 0,
      totalEvents: 0
    };

    res.json({
      success: true,
      data: {
        totalCommunities,
        ...result,
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error("Error in getCommunityStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community stats",
      error: error.message
    });
  }
};

// Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10, timeframe = 'week' } = req.query;

    // Calculate date threshold based on timeframe
    let dateThreshold;
    switch (timeframe) {
      case 'day':
        dateThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const communities = await Community.find({ isActive: true })
      .populate('posts.author', 'name username avatar')
      .populate('posts.comments.author', 'name username avatar');

    let trendingPosts = [];

    communities.forEach(community => {
      community.posts.forEach(post => {
        if (post.createdAt >= dateThreshold) {
          const engagementScore = (post.likes.length * 2) + (post.comments.length * 3);
          const timeDecay = Math.exp(-(Date.now() - post.createdAt.getTime()) / (24 * 60 * 60 * 1000));
          const trendingScore = engagementScore * timeDecay;

          trendingPosts.push({
            ...post.toObject(),
            community: {
              _id: community._id,
              name: community.name,
              image: community.image
            },
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            trendingScore
          });
        }
      });
    });

    // Sort by trending score and limit results
    trendingPosts.sort((a, b) => b.trendingScore - a.trendingScore);
    trendingPosts = trendingPosts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: trendingPosts,
      timeframe,
      total: trendingPosts.length
    });

  } catch (error) {
    console.error("Error in getTrendingPosts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending posts",
      error: error.message
    });
  }
};

// Get posts from followed communities
export const getFollowingPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get user's followed communities
    const user = await User.findById(req.user.id).select('following');

    if (!user || !user.following || user.following.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          pages: 0,
          page: 1,
          limit: parseInt(limit),
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Find communities where user is a member
    const communities = await Community.find({
      "members.user": req.user.id,
      "members.isActive": true,
      isActive: true
    })
      .populate('posts.author', 'name username avatar')
      .populate('posts.comments.author', 'name username avatar');

    let followingPosts = [];

    communities.forEach(community => {
      community.posts.forEach(post => {
        followingPosts.push({
          ...post.toObject(),
          community: {
            _id: community._id,
            name: community.name,
            image: community.image
          },
          likesCount: post.likes.length,
          commentsCount: post.comments.length,
          isLiked: post.likes.includes(req.user.id)
        });
      });
    });

    // Sort by creation date (latest first)
    followingPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = followingPosts.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPosts = followingPosts.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Error in getFollowingPosts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching following posts",
      error: error.message
    });
  }
};

// Increment post view
export const incrementPostView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);

    // Check if user already viewed
    const hasViewed = post.views.some(view => view.user.toString() === userId);

    if (!hasViewed) {
      post.views.push({ user: userId, viewedAt: new Date() });
      await community.save();
    }

    res.json({
      success: true,
      data: {
        viewsCount: post.views.length
      }
    });

  } catch (error) {
    console.error("Error in incrementPostView:", error);
    res.status(500).json({
      success: false,
      message: "Error incrementing view",
      error: error.message
    });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne({ "posts._id": id });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(id);
    post.shares = (post.shares || 0) + 1;
    await community.save();

    res.json({
      success: true,
      data: {
        shares: post.shares
      }
    });

  } catch (error) {
    console.error("Error in sharePost:", error);
    res.status(500).json({
      success: false,
      message: "Error sharing post",
      error: error.message
    });
  }
};

// Like comment
export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const likeIndex = comment.likes.findIndex(like => like.user.toString() === userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push({ user: userId, createdAt: new Date() });
    }

    await community.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? "Comment unliked" : "Comment liked",
      data: {
        isLiked: likeIndex === -1,
        likesCount: comment.likes.length
      }
    });

  } catch (error) {
    console.error("Error in likeComment:", error);
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message
    });
  }
};

// Reply to comment
export const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required"
      });
    }

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const newReply = {
      author: userId,
      content: content.trim(),
      createdAt: new Date(),
      likes: []
    };

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(newReply);
    await community.save();

    // Get updated data with populated author
    const updatedCommunity = await Community.findById(community._id)
      .populate('posts.comments.replies.author', 'name username avatar');

    const updatedPost = updatedCommunity.posts.id(postId);
    const updatedComment = updatedPost.comments.id(commentId);
    const createdReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: createdReply
    });

  } catch (error) {
    console.error("Error in replyToComment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error: error.message
    });
  }
};

// Like reply
export const likeReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    const likeIndex = reply.likes.findIndex(like => like.user.toString() === userId);

    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push({ user: userId, createdAt: new Date() });
    }

    await community.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? "Reply unliked" : "Reply liked",
      data: {
        isLiked: likeIndex === -1,
        likesCount: reply.likes.length
      }
    });

  } catch (error) {
    console.error("Error in likeReply:", error);
    res.status(500).json({
      success: false,
      message: "Error liking reply",
      error: error.message
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment"
      });
    }

    comment.content = content.trim();
    comment.updatedAt = new Date();

    await community.save();

    // Return updated comment
    const updatedCommunity = await Community.findOne({ "posts._id": postId })
      .populate("posts.comments.author", "name username avatar");

    const updatedPost = updatedCommunity.posts.id(postId);
    const updatedComment = updatedPost.comments.id(commentId);

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment
    });

  } catch (error) {
    console.error("Error in updateComment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user is the comment author, post author, or community admin
    if (comment.author.toString() !== req.user.id &&
      post.author.toString() !== req.user.id &&
      !community.admins.includes(req.user.id) &&
      !community.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    // Remove the comment
    post.comments.pull(commentId);
    await community.save();

    res.json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message
    });
  }
};

// Update reply
export const updateReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required"
      });
    }

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    // Check if user is the reply author
    if (reply.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reply"
      });
    }

    reply.content = content.trim();
    reply.updatedAt = new Date();

    await community.save();

    // Return updated reply
    const updatedCommunity = await Community.findOne({ "posts._id": postId })
      .populate("posts.comments.replies.author", "name username avatar");

    const updatedPost = updatedCommunity.posts.id(postId);
    const updatedComment = updatedPost.comments.id(commentId);
    const updatedReply = updatedComment.replies.id(replyId);

    res.json({
      success: true,
      message: "Reply updated successfully",
      data: updatedReply
    });

  } catch (error) {
    console.error("Error in updateReply:", error);
    res.status(500).json({
      success: false,
      message: "Error updating reply",
      error: error.message
    });
  }
};

// Delete reply
export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const community = await Community.findOne({ "posts._id": postId });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const post = community.posts.id(postId);
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    // Check if user is the reply author, comment author, post author, or community admin
    if (reply.author.toString() !== req.user.id &&
      comment.author.toString() !== req.user.id &&
      post.author.toString() !== req.user.id &&
      !community.admins.includes(req.user.id) &&
      !community.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply"
      });
    }

    // Remove the reply
    comment.replies.pull(replyId);
    await community.save();

    res.json({
      success: true,
      message: "Reply deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteReply:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting reply",
      error: error.message
    });
  }
};

// Get join requests for community
export const getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id)
      .populate('joinRequests.user', 'name username avatar')
      .populate('creator', 'name username avatar');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const isCreator = community.creator._id.toString() === req.user.id;
    const isAdmin = community.admins?.some(a => a.toString() === req.user.id);
    const isModerator = community.moderators?.some(m => m.toString() === req.user.id);

    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view join requests"
      });
    }

    const pendingRequests = community.joinRequests.filter(r => r.status === 'pending');

    res.json({
      success: true,
      data: pendingRequests,
      total: pendingRequests.length
    });

  } catch (error) {
    console.error("Error in getJoinRequests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching join requests",
      error: error.message
    });
  }
};

// Handle join request (approve/reject)
export const handleJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'approve' or 'reject'"
      });
    }

    const community = await Community.findById(id)
      .populate('joinRequests.user', 'name username avatar');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const isCreator = community.creator.toString() === req.user.id;
    const isAdmin = community.admins?.some(a => a.toString() === req.user.id);
    const isModerator = community.moderators?.some(m => m.toString() === req.user.id);

    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage join requests"
      });
    }

    const request = community.joinRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Join request not found"
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed"
      });
    }

    if (action === 'approve') {
      const existingMember = community.members.find(
        m => m.user.toString() === request.user._id.toString()
      );

      if (existingMember) {
        existingMember.isActive = true;
        existingMember.joinedAt = new Date();
      } else {
        community.members.push({
          user: request.user._id,
          role: 'member',
          joinedAt: new Date(),
          isActive: true
        });
      }

      request.status = 'approved';

      try {
        await completeUserAction(request.user._id, {
          action: 'community_join',
          points: POINT_VALUES.COMMUNITY_JOIN,
          category: community.category || 'overall',
          statUpdates: { communitiesJoined: 1 },
          relatedId: id,
          checkAchievements: true
        });

        const user = await User.findById(request.user._id);
        await user.addNotification({
          type: 'community',
          title: 'Request Approved',
          message: `Your request to join "${community.name}" has been approved!`,
          relatedCommunity: id,
          priority: 'normal'
        });
      } catch (statsError) {
        console.error('Error updating user stats:', statsError);
      }
    } else {
      request.status = 'rejected';

      try {
        const user = await User.findById(request.user._id);
        await user.addNotification({
          type: 'community',
          title: 'Request Declined',
          message: `Your request to join "${community.name}" was declined.`,
          relatedCommunity: id,
          priority: 'low'
        });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
      }
    }

    await community.save();

    res.json({
      success: true,
      message: action === 'approve' ? 'Request approved successfully' : 'Request rejected'
    });

  } catch (error) {
    console.error("Error in handleJoinRequest:", error);
    res.status(500).json({
      success: false,
      message: "Error processing join request",
      error: error.message
    });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Use 'member', 'moderator', or 'admin'"
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const isCreator = community.creator.toString() === req.user.id;
    const isAdmin = community.admins?.some(a => a.toString() === req.user.id);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update member roles"
      });
    }

    if (memberId === community.creator.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the creator's role"
      });
    }

    if (role === 'admin' && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can assign admin role"
      });
    }

    const member = community.members.find(m => m.user.toString() === memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const previousRole = member.role;
    member.role = role;

    if (role === 'admin') {
      if (!community.admins.includes(memberId)) {
        community.admins.push(memberId);
      }
      community.moderators = community.moderators.filter(m => m.toString() !== memberId);
    } else if (role === 'moderator') {
      if (!community.moderators.includes(memberId)) {
        community.moderators.push(memberId);
      }
      community.admins = community.admins.filter(a => a.toString() !== memberId);
    } else {
      community.admins = community.admins.filter(a => a.toString() !== memberId);
      community.moderators = community.moderators.filter(m => m.toString() !== memberId);
    }

    await community.save();

    try {
      const user = await User.findById(memberId);
      await user.addNotification({
        type: 'community',
        title: 'Role Updated',
        message: `Your role in "${community.name}" has been changed from ${previousRole} to ${role}.`,
        relatedCommunity: id,
        priority: 'normal'
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }

    res.json({
      success: true,
      message: `Member role updated to ${role}`,
      data: { memberId, role }
    });

  } catch (error) {
    console.error("Error in updateMemberRole:", error);
    res.status(500).json({
      success: false,
      message: "Error updating member role",
      error: error.message
    });
  }
};

// Remove member from community
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    const isCreator = community.creator.toString() === req.user.id;
    const isAdmin = community.admins?.some(a => a.toString() === req.user.id);
    const isModerator = community.moderators?.some(m => m.toString() === req.user.id);

    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove members"
      });
    }

    if (memberId === community.creator.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the community creator"
      });
    }

    const targetMember = community.members.find(m => m.user.toString() === memberId);
    if (isModerator && !isCreator && !isAdmin) {
      if (targetMember?.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: "Moderators cannot remove admins"
        });
      }
    }

    if (targetMember) {
      targetMember.isActive = false;
    }

    community.admins = community.admins.filter(a => a.toString() !== memberId);
    community.moderators = community.moderators.filter(m => m.toString() !== memberId);

    await community.save();

    try {
      const user = await User.findById(memberId);
      await user.addNotification({
        type: 'community',
        title: 'Removed from Community',
        message: `You have been removed from "${community.name}".`,
        relatedCommunity: id,
        priority: 'normal'
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }

    res.json({
      success: true,
      message: "Member removed successfully"
    });

  } catch (error) {
    console.error("Error in removeMember:", error);
    res.status(500).json({
      success: false,
      message: "Error removing member",
      error: error.message
    });
  }
};

// Get community members with details
export const getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { search, role, page = 1, limit = 20 } = req.query;

    const community = await Community.findById(id)
      .populate('members.user', 'name username avatar')
      .populate('creator', 'name username avatar')
      .populate('admins', 'name username avatar')
      .populate('moderators', 'name username avatar');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    let members = community.members.filter(m => m.isActive);

    if (role && role !== 'all') {
      members = members.filter(m => m.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter(m =>
        m.user?.name?.toLowerCase().includes(searchLower) ||
        m.user?.username?.toLowerCase().includes(searchLower)
      );
    }

    const total = members.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMembers = members.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginatedMembers,
      creator: community.creator,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Error in getCommunityMembers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching members",
      error: error.message
    });
  }
};
