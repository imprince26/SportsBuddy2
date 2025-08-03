import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['announcement', 'system', 'event', 'marketing', 'urgent'],
        default: 'announcement'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent', 'failed', 'cancelled'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    recipients: {
        type: String,
        enum: ['all', 'users', 'admins', 'specific'],
        default: 'all'
    },
    specificRecipients: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: String,
        name: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    sentAt: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    },
    recipientCount: {
        type: Number,
        default: 0
    },
    deliveredCount: {
        type: Number,
        default: 0
    },
    readCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    engagementRate: {
        type: Number,
        default: 0
    },
    metadata: {
        emailSent: {
            type: Boolean,
            default: false
        },
        pushSent: {
            type: Boolean,
            default: false
        },
        inAppSent: {
            type: Boolean,
            default: false
        },
        template: String,
        actionUrl: String,
        imageUrl: String,
        relatedCommunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        },
        relatedVenue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue'
        },
        achievementData: {
            title: String,
            icon: String,
            points: Number,
            category: String
        },
        leaderboardData: {
            rank: Number,
            category: String,
            points: Number
        }
    },
    deliveryLogs: [{
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: String,
        deliveryStatus: {
            type: String,
            enum: ['pending', 'delivered', 'failed', 'bounced'],
            default: 'pending'
        },
        deliveredAt: Date,
        readAt: Date,
        errorMessage: String,
        attempt: {
            type: Number,
            default: 1
        }
    }],
    statistics: {
        opens: {
            type: Number,
            default: 0
        },
        clicks: {
            type: Number,
            default: 0
        },
        unsubscribes: {
            type: Number,
            default: 0
        },
        bounces: {
            type: Number,
            default: 0
        }
    },
    tags: [String],
    archived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ createdBy: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ recipients: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'deliveryLogs.recipient': 1 });

notificationSchema.virtual('calculatedEngagementRate').get(function () {
    if (this.recipientCount === 0) return 0;
    return ((this.readCount / this.recipientCount) * 100).toFixed(2);
});

notificationSchema.pre('save', async function (next) {
    if (this.isModified('recipients') || this.isNew) {
        try {
            const User = mongoose.model('User');

            if (this.recipients === 'all') {
                this.recipientCount = await User.countDocuments();
            } else if (this.recipients === 'users') {
                this.recipientCount = await User.countDocuments({ role: 'user' });
            } else if (this.recipients === 'admins') {
                this.recipientCount = await User.countDocuments({ role: 'admin' });
            } else if (this.recipients === 'specific') {
                this.recipientCount = this.specificRecipients.length;
            }
        } catch (error) {
            console.error('Error calculating recipient count:', error);
        }
    }
    next();
});

notificationSchema.methods.markAsSent = function () {
    this.status = 'sent';
    this.sentAt = new Date();
    return this.save();
};

notificationSchema.methods.markAsFailed = function (errorMessage) {
    this.status = 'failed';
    this.metadata.errorMessage = errorMessage;
    return this.save();
};

notificationSchema.methods.addDeliveryLog = function (recipientData) {
    this.deliveryLogs.push(recipientData);
    return this.save();
};

notificationSchema.methods.updateStatistics = function () {
    this.deliveredCount = this.deliveryLogs.filter(log => log.deliveryStatus === 'delivered').length;
    this.readCount = this.deliveryLogs.filter(log => log.readAt).length;
    this.failedCount = this.deliveryLogs.filter(log => log.deliveryStatus === 'failed').length;
    this.engagementRate = this.recipientCount > 0 ? ((this.readCount / this.recipientCount) * 100) : 0;
    return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
