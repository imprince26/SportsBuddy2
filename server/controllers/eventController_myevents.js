import Event from "../models/eventModel.js";
import User from "../models/userModel.js";

// Get user's joined events
export const getUserJoinedEvents = async (req, res) => {
    try {
        const {
            status,
            paymentStatus,
            dateRange,
            search,
            sortBy = "date:desc",
            page = 1,
            limit = 12
        } = req.query;

        const userId = req.user._id;

        // Build query
        const query = {
            "participants.user": userId
        };

        // Status filter
        if (status && status !== "all") {
            query.status = status;
        }

        // Payment status filter
        if (paymentStatus && paymentStatus !== "all") {
            query["participants.paymentStatus"] = paymentStatus;
        }

        // Date range filter
        if (dateRange && dateRange !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (dateRange) {
                case "thisWeek":
                    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    query.date = { $gte: today, $lt: endOfWeek };
                    break;
                case "thisMonth":
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    query.date = { $gte: today, $lt: endOfMonth };
                    break;
                case "upcoming":
                    query.date = { $gte: today };
                    break;
            }
        }

        // Search filter
        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
                { "location.city": { $regex: search.trim(), $options: "i" } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sorting
        let sort = {};
        if (sortBy) {
            const [field, order] = sortBy.split(":");
            switch (field) {
                case "date":
                    sort.date = order === "desc" ? -1 : 1;
                    break;
                case "name":
                    sort.name = order === "desc" ? -1 : 1;
                    break;
                default:
                    sort.date = -1;
            }
        }

        const [events, total] = await Promise.all([
            Event.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate("createdBy", "name avatar username")
                .populate("participants.user", "name avatar")
                .lean(),
            Event.countDocuments(query)
        ]);

        // Add user-specific data to each event
        const eventsWithUserData = events.map(event => {
            const userParticipant = event.participants.find(
                p => p.user._id.toString() === userId.toString()
            );

            return {
                ...event,
                userPaymentStatus: userParticipant?.paymentStatus || "confirmed",
                userPaymentMethod: userParticipant?.paymentMethod || "free",
                userJoinedAt: userParticipant?.joinedAt,
                isOrganizer: event.createdBy._id.toString() === userId.toString()
            };
        });

        res.json({
            success: true,
            data: eventsWithUserData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)) || 1,
                total,
                hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error("Get user joined events error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching your events",
            error: error.message
        });
    }
};
