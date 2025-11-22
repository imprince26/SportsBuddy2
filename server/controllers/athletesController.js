import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import asyncHandler from 'express-async-handler';

// Get all athletes with filtering and pagination
export const getAllAthletes = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = "",
            sport = "",
            skillLevel = "",
            location = "",
            sortBy = "joinedDate:desc"
        } = req.query;

        // Build query
        let query = {
            role: { $ne: 'admin' } // Exclude admin users
        };

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        // Sport filter
        if (sport && sport !== 'all') {
            query['sportsPreferences.sport'] = sport;
        }

        // Skill level filter
        if (skillLevel && skillLevel !== 'all') {
            query['sportsPreferences.skillLevel'] = skillLevel;
        }

        // Location filter
        if (location) {
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } },
                { 'location.country': { $regex: location, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        let sort = {};
        if (sortBy) {
            const [field, order] = sortBy.split(":");
            switch (field) {
                case "joinedDate":
                    sort.createdAt = order === "desc" ? -1 : 1;
                    break;
                case "name":
                    sort.name = order === "desc" ? -1 : 1;
                    break;
                case "followers":
                    sort.followersCount = order === "desc" ? -1 : 1;
                    break;
                case "eventsCount":
                    sort.eventsParticipated = order === "desc" ? -1 : 1;
                    break;
                default:
                    sort.createdAt = -1;
            }
        }

        // Get total count
        const total = await User.countDocuments(query);

        // Get athletes with aggregation for additional stats
        const athletes = await User.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "participants.user",
                    as: "participatedEvents"
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "createdEvents"
                }
            },
            {
                $addFields: {
                    eventsParticipated: { $size: "$participatedEvents" },
                    eventsCreated: { $size: "$createdEvents" },
                    followersCount: { $size: { $ifNull: ["$followers", []] } },
                    followingCount: { $size: { $ifNull: ["$following", []] } },
                    totalEvents: {
                        $add: [
                            { $size: "$participatedEvents" },
                            { $size: "$createdEvents" }
                        ]
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    notifications: 0,
                    resetPasswordToken: 0,
                    resetPasswordExpire: 0,
                    participatedEvents: 0,
                    createdEvents: 0
                }
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limitNum }
        ]);

        // Get available sports for filtering
        const availableSports = await User.aggregate([
            { $unwind: "$sportsPreferences" },
            { $group: { _id: "$sportsPreferences.sport" } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: athletes,
            pagination: {
                total,
                pages: Math.ceil(total / limitNum),
                page: pageNum,
                limit: limitNum,
                hasNext: pageNum < Math.ceil(total / limitNum),
                hasPrev: pageNum > 1
            },
            filters: {
                search: search || "",
                sport: sport || "all",
                skillLevel: skillLevel || "all",
                location: location || "",
                sortBy: sortBy || "joinedDate:desc"
            },
            stats: {
                totalAthletes: total,
                availableSports: availableSports.map(s => s._id),
                avgEventsPerAthlete: athletes.length > 0
                    ? Math.round(athletes.reduce((sum, a) => sum + (a.totalEvents || 0), 0) / athletes.length)
                    : 0
            }
        });

    } catch (error) {
        console.error("Error in getAllAthletes:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching athletes",
            error: error.message
        });
    }
});

// Get athlete by ID with detailed stats
export const getAthleteById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const athlete = await User.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "participants.user",
                    as: "participatedEvents",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                category: 1,
                                date: 1,
                                status: 1,
                                images: { $arrayElemAt: ["$images", 0] }
                            }
                        },
                        { $sort: { date: -1 } },
                        { $limit: 10 }
                    ]
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "createdEvents",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                category: 1,
                                date: 1,
                                status: 1,
                                participantCount: { $size: "$participants" },
                                images: { $arrayElemAt: ["$images", 0] }
                            }
                        },
                        { $sort: { date: -1 } },
                        { $limit: 10 }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followers",
                    foreignField: "_id",
                    as: "followersDetails",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                username: 1,
                                avatar: 1
                            }
                        },
                        { $limit: 20 }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "followingDetails",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                username: 1,
                                avatar: 1
                            }
                        },
                        { $limit: 20 }
                    ]
                }
            },
            {
                $addFields: {
                    eventsParticipated: { $size: "$participatedEvents" },
                    eventsCreated: { $size: "$createdEvents" },
                    followersCount: { $size: { $ifNull: ["$followers", []] } },
                    followingCount: { $size: { $ifNull: ["$following", []] } },
                    isCurrentUser: { $eq: ["$_id", req.user?._id] }
                }
            },
            {
                $project: {
                    password: 0,
                    notifications: 0,
                    resetPasswordToken: 0,
                    resetPasswordExpire: 0,
                    followers: 0,
                    following: 0
                }
            }
        ]);

        if (!athlete || athlete.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        res.json({
            success: true,
            data: athlete[0]
        });

    } catch (error) {
        console.error("Error in getAthleteById:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching athlete details",
            error: error.message
        });
    }
});

// Follow/Unfollow athlete
export const toggleFollowAthlete = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        if (id === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const athleteToFollow = await User.findById(id);
        const currentUser = await User.findById(currentUserId);

        if (!athleteToFollow) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: id }
            });
            const updatedAthlete = await User.findByIdAndUpdate(id, {
                $pull: { followers: currentUserId }
            }, { new: true });

            res.json({
                success: true,
                message: "Unfollowed successfully",
                data: {
                    isFollowing: false,
                    followersCount: updatedAthlete.followers.length
                }
            });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: id }
            });
            const updatedAthlete = await User.findByIdAndUpdate(id, {
                $addToSet: { followers: currentUserId }
            }, { new: true });

            // Add notification to the followed user
            await User.findByIdAndUpdate(id, {
                $push: {
                    notifications: {
                        type: "follow",
                        message: `${currentUser.name} started following you`,
                        from: currentUserId,
                        createdAt: new Date()
                    }
                }
            });

            res.json({
                success: true,
                message: "Followed successfully",
                data: {
                    isFollowing: true,
                    followersCount: updatedAthlete.followers.length
                }
            });
        }

    } catch (error) {
        console.error("Error in toggleFollowAthlete:", error);
        res.status(500).json({
            success: false,
            message: "Error updating follow status",
            error: error.message
        });
    }
});

// Get top athletes (for leaderboard)
export const getTopAthletes = asyncHandler(async (req, res) => {
    try {
        const { limit = 10, category = "overall" } = req.query;

        let matchCondition = { role: { $ne: 'admin' } };

        // Category-specific filtering
        if (category !== "overall") {
            matchCondition['sportsPreferences.sport'] = category;
        }

        const topAthletes = await User.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "participants.user",
                    as: "participatedEvents"
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "createdEvents"
                }
            },
            {
                $addFields: {
                    eventsParticipated: { $size: "$participatedEvents" },
                    eventsCreated: { $size: "$createdEvents" },
                    followersCount: { $size: { $ifNull: ["$followers", []] } },
                    totalScore: {
                        $add: [
                            { $multiply: [{ $size: "$participatedEvents" }, 2] },
                            { $multiply: [{ $size: "$createdEvents" }, 3] },
                            { $size: { $ifNull: ["$followers", []] } }
                        ]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    avatar: 1,
                    sportsPreferences: 1,
                    location: 1,
                    eventsParticipated: 1,
                    eventsCreated: 1,
                    followersCount: 1,
                    totalScore: 1,
                    createdAt: 1
                }
            },
            { $sort: { totalScore: -1, eventsParticipated: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Add ranking
        const rankedAthletes = topAthletes.map((athlete, index) => ({
            ...athlete,
            rank: index + 1
        }));

        res.json({
            success: true,
            data: rankedAthletes,
            category: category,
            total: rankedAthletes.length
        });

    } catch (error) {
        console.error("Error in getTopAthletes:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching top athletes",
            error: error.message
        });
    }
});

// Get athlete achievements
export const getAthleteAchievements = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const athlete = await User.findById(id).select('achievements name username');

        if (!athlete) {
            return res.status(404).json({
                success: false,
                message: "Athlete not found"
            });
        }

        // Calculate dynamic achievements
        const eventsParticipated = await Event.countDocuments({
            "participants.user": id
        });

        const eventsCreated = await Event.countDocuments({
            createdBy: id
        });

        const followers = await User.findById(id).select('followers');
        const followersCount = followers?.followers?.length || 0;

        // Generate achievements based on activity
        let dynamicAchievements = [];

        if (eventsParticipated >= 1) {
            dynamicAchievements.push({
                title: "First Steps",
                description: "Participated in your first event",
                icon: "🏃",
                earnedAt: new Date(),
                category: "participation"
            });
        }

        if (eventsParticipated >= 10) {
            dynamicAchievements.push({
                title: "Active Participant",
                description: "Participated in 10 events",
                icon: "🎯",
                earnedAt: new Date(),
                category: "participation"
            });
        }

        if (eventsCreated >= 1) {
            dynamicAchievements.push({
                title: "Event Organizer",
                description: "Created your first event",
                icon: "📅",
                earnedAt: new Date(),
                category: "organization"
            });
        }

        if (followersCount >= 10) {
            dynamicAchievements.push({
                title: "Popular Athlete",
                description: "Gained 10 followers",
                icon: "⭐",
                earnedAt: new Date(),
                category: "social"
            });
        }

        // Combine stored and dynamic achievements
        const allAchievements = [
            ...(athlete.achievements || []),
            ...dynamicAchievements
        ];

        res.json({
            success: true,
            data: {
                athlete: {
                    id: athlete._id,
                    name: athlete.name,
                    username: athlete.username
                },
                achievements: allAchievements,
                stats: {
                    eventsParticipated,
                    eventsCreated,
                    followersCount,
                    totalAchievements: allAchievements.length
                }
            }
        });

    } catch (error) {
        console.error("Error in getAthleteAchievements:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching athlete achievements",
            error: error.message
        });
    }
});

// Search athletes
export const searchAthletes = asyncHandler(async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const athletes = await User.find({
            role: { $ne: 'admin' },
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
                { 'sportsPreferences.sport': { $regex: q, $options: 'i' } }
            ]
        })
            .select('name username avatar sportsPreferences location createdAt')
            .limit(parseInt(limit))
            .sort({ name: 1 });

        res.json({
            success: true,
            data: athletes,
            query: q,
            total: athletes.length
        });

    } catch (error) {
        console.error("Error in searchAthletes:", error);
        res.status(500).json({
            success: false,
            message: "Error searching athletes",
            error: error.message
        });
    }
});
