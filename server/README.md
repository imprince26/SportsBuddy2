# SportsBuddy Server

**Express.js backend API for the SportsBuddy sports management platform**

## Overview

The SportsBuddy server is a robust RESTful API built with Express.js, providing comprehensive backend services for user management, event coordination, venue booking, athlete profiles, community features, and real-time communication.

## Technology Stack

### Core Framework
- **Node.js 18.x** - JavaScript runtime environment
- **Express.js 4.18.2** - Fast, unopinionated web framework
- **MongoDB 7.0** - NoSQL document database
- **Mongoose 7.5.0** - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken 9.0.1)** - JSON Web Token authentication
- **bcryptjs 2.4.3** - Password hashing
- **express-rate-limit 6.10.0** - Rate limiting middleware
- **helmet 6.1.5** - Security headers
- **cors 2.8.5** - Cross-origin resource sharing

### Real-time Communication
- **Socket.io 4.7.2** - Real-time bidirectional communication
- **Redis 4.6.8** - In-memory data structure store for caching

### File Upload & Media
- **Cloudinary 1.40.0** - Cloud-based media management
- **multer 1.4.5** - Middleware for handling file uploads

### Email & Notifications
- **Nodemailer 6.9.5** - Email sending functionality

### Development Tools
- **Nodemon 2.0.22** - Development server auto-restart
- **Morgan 1.10.0** - HTTP request logger
- **Dotenv 16.3.1** - Environment variable management

### Validation & Utilities
- **Zod 3.21.4** - TypeScript-first schema validation
- **UUID 9.0.0** - Unique identifier generation

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend email verification

#### Protected Endpoints
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

### User Management Routes (`/api/users`)

#### Public Endpoints
- `GET /api/users/search` - Search users by query parameters

#### Protected Endpoints
- `GET /api/users/my-bookings` - Get user's venue bookings
- `GET /api/users/events` - Get user's created events
- `PUT /api/users/preferences` - Update user preferences
- `POST /api/users/:userId/follow` - Follow/unfollow a user
- `GET /api/users/:userId/followers` - Get user's followers
- `GET /api/users/:userId/following` - Get users being followed
- `GET /api/users/stats/:userId` - Get user statistics
- `GET /api/users/:userId` - Get user profile by ID

### Event Management Routes (`/api/events`)

#### Public Endpoints
- `GET /api/events` - Get all events with filtering
- `GET /api/events/search` - Search events by criteria
- `GET /api/events/categories` - Get event categories
- `GET /api/events/:id` - Get event details by ID

#### Protected Endpoints
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update existing event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join an event
- `POST /api/events/:id/leave` - Leave an event
- `POST /api/events/:id/message` - Send message in event chat
- `GET /api/events/:id/messages` - Get event chat messages
- `POST /api/events/:id/photos` - Upload event photos

### Venue Management Routes (`/api/venues`)

#### Public Endpoints
- `GET /api/venues` - Get all venues with filtering
- `GET /api/venues/search` - Search venues by criteria
- `GET /api/venues/:id` - Get venue details by ID
- `GET /api/venues/:id/reviews` - Get venue reviews

#### Protected Endpoints
- `POST /api/venues` - Create new venue
- `PUT /api/venues/:id` - Update venue information
- `DELETE /api/venues/:id` - Delete venue
- `POST /api/venues/:id/book` - Book a venue
- `PUT /api/venues/:id/cancel-booking/:bookingId` - Cancel venue booking
- `POST /api/venues/:id/review` - Add venue review
- `PUT /api/venues/:id/review/:reviewId` - Update venue review
- `DELETE /api/venues/:id/review/:reviewId` - Delete venue review

### Athletes Routes (`/api/athletes`)

#### Public Endpoints
- `GET /api/athletes` - Get all athletes
- `GET /api/athletes/search` - Search athletes
- `GET /api/athletes/top` - Get top athletes
- `GET /api/athletes/:id` - Get athlete profile by ID
- `GET /api/athletes/:id/achievements` - Get athlete achievements

#### Protected Endpoints
- `POST /api/athletes/:id/follow` - Follow/unfollow athlete

### Community Routes (`/api/community`)

#### Public Endpoints
- `GET /api/community` - Get community posts with filtering

#### Protected Endpoints
- `POST /api/community` - Create new community post
- `GET /api/community/:id` - Get post details by ID
- `PUT /api/community/:id` - Update community post
- `DELETE /api/community/:id` - Delete community post
- `POST /api/community/:id/like` - Like/unlike a post
- `POST /api/community/:id/comment` - Add comment to post
- `PUT /api/community/:id/comment/:commentId` - Update comment
- `DELETE /api/community/:id/comment/:commentId` - Delete comment

### Leaderboard Routes (`/api/leaderboard`)

#### Public Endpoints
- `GET /api/leaderboard` - Get leaderboard rankings
- `GET /api/leaderboard/categories` - Get leaderboard categories
- `GET /api/leaderboard/sport/:sport` - Get sport-specific leaderboard
- `GET /api/leaderboard/stats` - Get leaderboard statistics
- `GET /api/leaderboard/achievements/:userId` - Get user achievements
- `GET /api/leaderboard/trophies` - Get available trophies

#### Protected Endpoints
- `GET /api/leaderboard/user/:userId/ranking` - Get user's ranking
- `GET /api/leaderboard/user/:userId/stats` - Get user's statistics
- `GET /api/leaderboard/monthly` - Get monthly leaderboard

#### Admin Endpoints
- `POST /api/leaderboard/user/:userId/score` - Update user score (Admin only)

### Notification Routes (`/api/notifications`)

#### Protected Endpoints
- `GET /api/notifications/bulk` - Get bulk notifications (Admin)
- `POST /api/notifications/bulk` - Create bulk notification (Admin)
- `GET /api/notifications/bulk/:id` - Get bulk notification by ID (Admin)
- `PUT /api/notifications/bulk/:id` - Update bulk notification (Admin)
- `DELETE /api/notifications/bulk/:id` - Delete bulk notification (Admin)
- `POST /api/notifications/bulk/:id/send` - Send bulk notification now (Admin)
- `PUT /api/notifications/bulk/:id/archive` - Archive bulk notification (Admin)
- `GET /api/notifications/user` - Get user's notifications
- `PUT /api/notifications/user/read-all` - Mark all notifications as read
- `DELETE /api/notifications/user/:notificationId` - Delete user notification
- `PUT /api/notifications/user/:notificationId/read` - Mark notification as read
- `POST /api/notifications/user/:userId/send` - Send personal notification (Admin)
- `POST /api/notifications/event/:eventId` - Send event notification
- `GET /api/notifications/stats` - Get notification statistics (Admin)
- `GET /api/notifications/templates` - Get notification templates (Admin)

### Admin Routes (`/api/admin`) - Admin Only

#### Dashboard & Analytics
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/analytics/export` - Export analytics as PDF

#### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

#### Event Management
- `GET /api/admin/events` - Get all events
- `GET /api/admin/events/stats` - Get event statistics
- `GET /api/admin/events/export` - Export events data
- `GET /api/admin/events/:id` - Get event by ID
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `PUT /api/admin/events/:id/approve` - Approve event
- `PUT /api/admin/events/:id/reject` - Reject event

#### Community Management
- `GET /api/admin/communities` - Get all communities
- `GET /api/admin/communities/:id` - Get community by ID
- `PUT /api/admin/communities/:id` - Update community (Admin)
- `DELETE /api/admin/communities/:id` - Delete community (Admin)

#### Search & Utilities
- `GET /api/admin/search` - Admin search functionality
- `GET /api/admin/venue-bookings` - Get all venue bookings

### File Upload Routes (`/api/upload`)

#### Protected Endpoints
- `POST /api/upload/event` - Upload event images (up to 5 files)
- `POST /api/upload/avatar` - Upload user avatar

## Key Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access Control**: User, Admin, and Athlete roles
- **Password Security**: Bcrypt hashing with salt rounds
- **Email Verification**: Account activation via email
- **Password Reset**: Secure password recovery flow

### Event Management
- **CRUD Operations**: Complete event lifecycle management
- **Real-time Chat**: Socket.io powered event messaging
- **Participant Management**: Join/leave functionality with capacity limits
- **Media Upload**: Cloudinary integration for event photos
- **Search & Filtering**: Advanced event discovery
- **Admin Moderation**: Event approval and management system

### Venue Management
- **Venue Directory**: Comprehensive venue database
- **Booking System**: Reservation management with availability checking
- **Review System**: User ratings and feedback
- **Location Services**: GPS-based venue search
- **Admin Oversight**: Venue management and moderation

### Athlete Profiles
- **Profile Management**: Detailed athlete information
- **Follow System**: Social networking features
- **Achievement Tracking**: Performance milestones and badges
- **Sports Categorization**: Multi-sport support with skill levels

### Community Platform
- **Post Management**: Create, edit, delete community posts
- **Engagement Features**: Like, comment, and share functionality
- **Content Moderation**: Admin controls for community management
- **Real-time Updates**: Live community interactions

### Leaderboard System
- **Performance Rankings**: Multi-criteria ranking algorithms
- **Sport Categories**: Specialized rankings by sport
- **Achievement System**: Badges, trophies, and milestones
- **Statistics Tracking**: Comprehensive performance metrics

### Notification System
- **Real-time Notifications**: Instant in-app alerts
- **Email Notifications**: SMTP-based email delivery
- **Bulk Notifications**: Admin broadcast functionality
- **Notification Templates**: Predefined message formats
- **Preference Management**: User notification settings

### Real-time Communication
- **Socket.io Integration**: Bidirectional real-time communication
- **Event Chat**: Participant messaging during events
- **Live Updates**: Real-time data synchronization
- **Connection Management**: Automatic reconnection handling

### File Upload & Media Management
- **Cloudinary Integration**: Cloud-based media storage
- **Multiple File Types**: Image upload support
- **Secure Upload**: File validation and size restrictions
- **CDN Delivery**: Optimized media delivery

### Caching & Performance
- **Redis Caching**: In-memory data caching for performance
- **Rate Limiting**: Request throttling to prevent abuse
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections

### Admin Dashboard
- **Analytics Dashboard**: Platform usage metrics
- **User Management**: Account administration tools
- **Content Moderation**: Review and manage user-generated content
- **System Configuration**: Platform settings management
- **Export Functionality**: Data export capabilities

## Database Models

### User Model
- Personal information (name, email, avatar)
- Authentication data (password hash, JWT tokens)
- Profile settings and preferences
- Social features (followers, following)
- Role-based permissions

### Event Model
- Event details (title, description, date, location)
- Participant management (attendees, capacity)
- Media attachments (photos, documents)
- Chat messages and interactions
- Admin approval status

### Venue Model
- Facility information (name, address, amenities)
- Booking management (availability, reservations)
- Review system (ratings, comments)
- Location data (coordinates, maps)
- Contact information

### Community Model
- Post content and metadata
- Engagement metrics (likes, comments, shares)
- Author information and timestamps
- Moderation status and flags

### Leaderboard Model
- Performance metrics and rankings
- Achievement tracking and badges
- Sport-specific categorizations
- Historical data and trends

### Notification Model
- Message content and delivery status
- User targeting and preferences
- Template-based notifications
- Delivery tracking and analytics

## Security Features

- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Mongoose ODM sanitization
- **XSS Protection**: Input sanitization and encoding
- **CSRF Protection**: Token-based request validation
- **Rate Limiting**: Request throttling with Redis
- **CORS Configuration**: Proper cross-origin policies
- **Security Headers**: Helmet.js security middleware
- **File Upload Security**: Type and size restrictions

## Error Handling

- **Global Error Handler**: Centralized error processing
- **Validation Errors**: Detailed input validation feedback
- **Authentication Errors**: Proper unauthorized access handling
- **Database Errors**: Connection and query error management
- **File Upload Errors**: Upload failure handling
- **Rate Limit Errors**: Throttling response management

## Logging & Monitoring

- **Morgan Logger**: HTTP request logging
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Response time tracking
- **Database Query Logging**: Query performance analysis
- **Security Event Logging**: Authentication and access logging

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```