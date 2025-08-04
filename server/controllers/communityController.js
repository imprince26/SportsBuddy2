import Community from '../models/communityModel.js';
import User from '../models/userModel.js';
import { cloudinary } from '../config/cloudinary.js';

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
        { $limit: parseInt(limit) }
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
        .limit(parseInt(limit))
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
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
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
        posts: visiblePosts.slice(0, 20), // Limit to recent posts
        memberCount: community.members.filter(m => m.isActive).length,
        isMember,
        memberRole,
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

    let uploadedImage = null;

    // Handle image upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
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
        throw new Error("Image upload failed: " + uploadError.message);
      }
    }

    const community = new Community({
      name,
      description,
      category,
      location: typeof location === "string" ? JSON.parse(location) : location,
      rules: Array.isArray(rules) ? rules : JSON.parse(rules || "[]"),
      isPrivate: isPrivate === "true",
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
    res.status(500).json({
      success: false,
      message: "Error creating community",
      error: error.message
    });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const { message } = req.body;
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
          featuredScore: 0,
          recentActivityCount: 0,
          posts: 0,
          members: 0,
          joinRequests: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: featuredCommunities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured communities",
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

    // Get posts from communities collection
    const communities = await Community.find(query.communityId ? { _id: query.communityId } : {})
      .populate({
        path: 'posts.author',
        select: 'name username avatar'
      })
      .populate({
        path: 'posts.comments.author',
        select: 'name username avatar'
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
      .populate("posts.comments.author", "name username avatar");

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
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLiked: req.user ? post.likes.includes(req.user.id) : false
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

    // Return updated post
    const updatedCommunity = await Community.findOne({ "posts._id": id })
      .populate("posts.author", "name username avatar")
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
        }
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

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes.pull(userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await community.save();

    res.json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      data: {
        isLiked: !isLiked,
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
