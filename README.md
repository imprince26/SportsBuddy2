<div align="center">
  
  # SportsBuddy
  
  **A comprehensive sports management platform connecting athletes, managing events, and building communities**
  
  **[Live Demo](https://sports-buddy2.vercel.app)** • **[Contributing](CONTRIBUTING.md)**
  
</div>

---

## Overview

SportsBuddy is a modern, full-stack web application designed to revolutionize sports community management. Built with cutting-edge technologies, it provides a comprehensive ecosystem for athletes to connect, organize events, track performance, and build lasting sporting relationships.

The platform serves sports enthusiasts of all levels - from casual weekend players to competitive athletes - offering tools for event management, community building, performance tracking, and real-time communication.

## Architecture & Technology Stack

<div align="center">

### Frontend Stack
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Latest-000000?style=for-the-badge)

### Backend Stack
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white&style=for-the-badge)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white&style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white&style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7.2-010101?logo=socket.io&logoColor=white&style=for-the-badge)

### Cloud & DevOps
![Cloudinary](https://img.shields.io/badge/Cloudinary-Latest-3448C5?logo=cloudinary&logoColor=white&style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Latest-000000?logo=vercel&logoColor=white&style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Latest-2088FF?logo=github-actions&logoColor=white&style=for-the-badge)

</div>

## Current Features

### 🔐 Authentication & User Management
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- **User Profiles**: Comprehensive profile management with avatars and cover images
- **Profile Privacy**: Public and private profile visibility controls
- **Social Features**: Follow/unfollow system with follower analytics
- **Account Security**: Password reset & email verification

### 🏃‍♂️ Athletes Management
- **Athlete Profiles**: Detailed athlete information and statistics
- **Sports Preferences**: Multi-sport support with skill level tracking
- **Achievement System**: Performance badges and recognition
- **Performance History**: Historical data and progress tracking

### 🏆 Events System
- **Event Creation**: Rich event creation with detailed information
- **Event Discovery**: Advanced filtering and search capabilities  
- **Real-time Updates**: Live event updates and participant notifications
- **Event Chat**: Integrated chat system for event communication
- **Participant Management**: Join/leave functionality
- **Event Categories**: Multi-sport event support
- **Location Integration**: Venue and location management
- **Media Gallery**: Event photos sharing

<!-- ### 👥 Community Platform
- **Community Forums**: Discussion boards for sports communities
- **Post Management**: Create, edit, and manage community posts
- **Engagement Features**: Like, comment, and share functionality
- **Community Moderation**: Admin controls and content management
- **Topic Categories**: Organized discussion topics
- **Community Analytics**: Engagement metrics and insights -->

<!-- ### 🏟️ Venue Management
- **Venue Directory**: Comprehensive venue database
- **Venue Profiles**: Detailed facility information and amenities
- **Booking System**: Venue reservation and scheduling
- **Location Services**: GPS integration and mapping
- **Venue Reviews**: User ratings and feedback system
- **Availability Tracking**: Real-time venue availability -->

<!-- ### 📊 Leaderboard System
- **Performance Rankings**: Multi-criteria ranking system
- **Skill-based Leaderboards**: Rankings by sport and skill level
- **Achievement Tracking**: Points and milestone system
- **Competition History**: Historical performance data
- **Category Filters**: Sport-specific and time-based rankings
- **Social Sharing**: Share achievements and rankings -->

### 🔔 Notification System
- **Real-time Notifications**: Instant in-app notifications
- **Email Notifications**: Comprehensive email notification system
- **Notification Preferences**: Customizable notification settings
- **Event Alerts**: Event reminders and updates
- **Social Notifications**: Follow requests, mentions, and interactions
- **System Announcements**: Platform updates and maintenance alerts

### ⚡ Real-time Features
- **Live Chat**: Socket.io powered real-time messaging
- **Event Updates**: Live event status and participant updates
- **Notification Streaming**: Real-time notification delivery
- **Activity Feeds**: Live activity streams and updates

### 🛡️ Admin Dashboard
- **User Management**: User accounts, roles, and permissions
- **Content Moderation**: Review and manage platform content
- **Event Oversight**: Monitor and manage platform events
- **Analytics Dashboard**: Platform usage and engagement metrics
- **System Configuration**: Platform settings and feature toggles
- **Report Management**: Handle user reports and violations

### 📱 Advanced Features
- **Responsive Design**: Mobile-first, cross-device compatibility
- **Dark/Light Themes**: User-customizable theme preferences
<!-- - **Progressive Web App**: PWA capabilities for mobile experience -->
- **File Upload System**: Cloudinary integration for media management
- **Search & Filters**: Advanced search across all platform content
- **Rate Limiting**: Security and performance optimization
- **Email Templates**: Beautiful, responsive email communications
<!-- - **Cron Jobs**: Automated tasks and maintenance -->

<!-- ## Platform Statistics -->

<!-- <div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>🎯 Features</strong><br/>
        <span style="font-size: 1.5em; color: #4CAF50;">50+</span><br/>
        <small>Active Features</small>
      </td>
      <td align="center">
        <strong>⚡ Performance</strong><br/>
        <span style="font-size: 1.5em; color: #2196F3;">95+</span><br/>
        <small>Lighthouse Score</small>
      </td>
      <td align="center">
        <strong>🔧 Components</strong><br/>
        <span style="font-size: 1.5em; color: #FF9800;">200+</span><br/>
        <small>UI Components</small>
      </td>
      <td align="center">
        <strong>📊 API Endpoints</strong><br/>
        <span style="font-size: 1.5em; color: #9C27B0;">80+</span><br/>
        <small>REST Endpoints</small>
      </td>
    </tr>
  </table>
</div>
 -->
## API Documentation

SportsBuddy provides a comprehensive RESTful API with the following endpoint categories:

### Authentication & Users
- `POST /api/auth/*` - Authentication endpoints (register, login, logout, reset)
- `GET /api/users/*` - User profile and management endpoints
- `PUT /api/users/*` - Profile updates and user actions

### Events Management  
- `GET /api/events` - Event discovery and filtering
- `POST /api/events` - Event creation and management
- `PUT /api/events/:id` - Event updates and participant actions

### Athletes & Teams
- `GET /api/athletes` - Athlete profiles and statistics
- `POST /api/athletes` - Athlete registration and team management
- `PUT /api/athletes/:id` - Profile updates and team actions

### Community Features
- `GET /api/community` - Community posts and discussions
- `POST /api/community` - Create posts and engage with content
- `PUT /api/community/:id` - Post management and moderation

### Venue Management
- `GET /api/venues` - Venue directory and search
- `POST /api/venues` - Venue registration and booking
- `PUT /api/venues/:id` - Venue updates and availability

### Leaderboard System
- `GET /api/leaderboard` - Rankings and performance data
- `POST /api/leaderboard` - Score submissions and achievements
- `PUT /api/leaderboard/:id` - Performance updates

### Notifications & Real-time
- `GET /api/notifications` - Notification management
- `WebSocket` - Real-time chat and live updates
- `POST /api/notifications` - Send notifications and alerts

### Administrative
- `GET /api/admin/*` - Admin dashboard and analytics
- `POST /api/admin/*` - User and content management
- `PUT /api/admin/*` - Platform configuration

## Project Structure

```
SportsBuddy2/
├── 📁 client/                    # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📁 ui/           # Shadcn/ui base components
│   │   │   ├── 📁 events/       # Event management components
│   │   │   ├── 📁 athletes/     # Athlete components
│   │   │   ├── 📁 venues/       # Venue components
│   │   │   ├── 📁 leaderboard/  # Leaderboard components
│   │   │   └── 📁 layout/       # Layout and navigation
│   │   ├── 📁 pages/            # Route-level page components
│   │   │   ├── 📁 auth/         # Authentication pages
│   │   │   ├── 📁 event/        # Event management pages
│   │   │   ├── 📁 athletes/     # Athlete pages
│   │   │   ├── 📁 community/    # Community pages
│   │   │   ├── 📁 venue/        # Venue pages
│   │   │   ├── 📁 leaderboard/  # Leaderboard pages
│   │   │   └── 📁 admin/        # Admin dashboard
│   │   ├── 📁 context/          # React Context providers
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 utils/            # Utility functions
│   │   └── 📁 schemas/          # Form validation schemas
│   └── 📁 public/               # Static assets
├── 📁 server/                   # Express.js backend
│   ├── 📁 controllers/          # Business logic controllers
│   ├── 📁 models/              # MongoDB/Mongoose models
│   ├── 📁 routes/              # API route definitions
│   ├── 📁 middleware/          # Custom middleware
│   ├── 📁 config/              # Configuration modules
│   ├── 📁 utils/               # Server utilities
│   └── 📁 scripts/             # Database and utility scripts
└── 📁 .github/                 # GitHub workflows and templates
    ├── 📁 workflows/           # CI/CD automation
    └── 📁 ISSUE_TEMPLATE/      # Issue templates
```

## Development Metrics

<div align="center">

![Languages](https://img.shields.io/badge/Languages-JavaScript%20|%20HTML%20|%20CSS-blue?style=flat-square)
![Code Quality](https://img.shields.io/badge/Code_Quality-ESLint%20|%20Prettier-green?style=flat-square)
![Testing](https://img.shields.io/badge/Testing-Jest%20|%20Vitest-red?style=flat-square)
![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-yellow?style=flat-square)

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-50k+-purple?style=flat-square)
![Commits](https://img.shields.io/github/commit-activity/m/imprince26/SportsBuddy2?style=flat-square&color=blue)
![Contributors](https://img.shields.io/github/contributors/imprince26/SportsBuddy2?style=flat-square&color=green)
![Last Commit](https://img.shields.io/github/last-commit/imprince26/SportsBuddy2?style=flat-square&color=orange)

</div>

## Security & Performance

- **Authentication**: JWT with HTTP-only cookies and refresh token rotation
- **Authorization**: Role-based access control (RBAC) system
- **Rate Limiting**: Advanced rate limiting with Redis integration
- **Input Validation**: Zod schema validation on both client and server
- **File Security**: Secure file upload with type and size restrictions
- **CORS**: Properly configured cross-origin resource sharing
- **Environment Security**: Environment-based configuration management
- **Performance**: Optimized bundle size and lazy loading
- **Monitoring**: Error tracking and performance monitoring
- **Database Security**: MongoDB Atlas with connection security