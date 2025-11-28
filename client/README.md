# SportsBuddy Client

**React frontend application for the SportsBuddy sports management platform**

## Overview

The SportsBuddy client is a modern React single-page application built with Vite, providing a comprehensive user interface for athletes, event organizers, and sports enthusiasts to connect, manage events, and build communities.

## Technology Stack

### Core Framework
- **React 18.2.0** - Modern React with hooks and concurrent features
- **Vite 5.1.5** - Fast build tool and development server
- **React Router 6.8.0** - Client-side routing and navigation

### UI & Styling
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library built on Radix UI
- **Radix UI** - Accessible, unstyled UI primitives
- **Framer Motion 10.12.16** - Animation library for React

### State Management & Data
- **Axios 1.4.0** - HTTP client for API communication
- **React Hook Form 7.43.9** - Performant forms with easy validation
- **Zod 3.21.4** - TypeScript-first schema validation
- **React Context** - State management for global app state

### Real-time Communication
- **Socket.io-client 4.7.2** - Real-time bidirectional communication

### Development Tools
- **ESLint 8.45.0** - Code linting and error detection
- **PostCSS 8.4.24** - CSS processing and optimization
- **Autoprefixer 10.4.14** - CSS vendor prefixing

## Key Features

### Authentication & User Management
- **JWT Authentication**: Secure login with HTTP-only cookies
- **User Registration**: Complete signup flow with email verification
- **Password Management**: Forgot/reset password functionality
- **Profile Management**: Comprehensive user profile editing
- **Avatar Upload**: Cloudinary integration for profile pictures

### Event Management
- **Event Discovery**: Browse and search events with filters
- **Event Creation**: Rich form for creating detailed events
- **Event Participation**: Join/leave events with real-time updates
- **Event Chat**: Integrated messaging for event participants
- **Event Media**: Photo gallery for event documentation

### Athlete Profiles
- **Profile Display**: Detailed athlete information and statistics
- **Follow System**: Social following with follower counts
- **Achievement Tracking**: Performance badges and milestones
- **Sports Preferences**: Multi-sport support with skill levels

### Venue Management
- **Venue Directory**: Search and browse available venues
- **Venue Details**: Comprehensive facility information
- **Booking System**: Reserve venues with availability checking
- **Venue Reviews**: Rating and feedback system

### Leaderboard System
- **Performance Rankings**: Multi-criteria ranking display
- **Sport Categories**: Rankings by specific sports
- **Achievement System**: Badges and milestone tracking
- **Personal Stats**: Individual performance metrics

### Community Features
- **Post Creation**: Create and share community posts
- **Engagement**: Like, comment, and share functionality
- **Discussion Threads**: Organized community discussions
- **Content Moderation**: Community guidelines and moderation

### Real-time Features
- **Live Chat**: Socket.io powered messaging
- **Event Updates**: Real-time participant and status updates
- **Notifications**: Instant in-app notifications
- **Activity Feeds**: Live activity streams

### UI/UX Features
- **Responsive Design**: Mobile-first approach with cross-device support
- **Dark/Light Themes**: User-customizable theme preferences
- **Smooth Animations**: Framer Motion powered transitions
- **Toast Notifications**: User-friendly feedback messages
- **Loading States**: Skeleton loaders and progress indicators

## Routing Structure

The application uses React Router for client-side routing with the following main routes:

### Public Routes
- `/` - Homepage with featured content
- `/events` - Event discovery and browsing
- `/venues` - Venue directory
- `/athletes` - Athlete profiles
- `/leaderboard` - Performance rankings
- `/community` - Community discussions
- `/auth/login` - User login
- `/auth/register` - User registration

### Protected Routes (Require Authentication)
- `/dashboard` - User dashboard
- `/events/create` - Create new event
- `/events/:id/edit` - Edit existing event
- `/events/my-events` - User's created events
- `/venues/book/:id` - Book a venue
- `/venues/my-bookings` - User's venue bookings
- `/profile` - User profile
- `/profile/edit` - Edit profile
- `/settings` - User settings
- `/leaderboard/my-stats` - Personal statistics

### Admin Routes (Require Admin Privileges)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/events` - Event management
- `/admin/analytics` - Platform analytics

## Development Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Component Architecture

The application follows a modular component architecture:

- **UI Components**: Reusable base components from Shadcn/ui
- **Feature Components**: Domain-specific components (events, athletes, venues)
- **Page Components**: Route-level components that compose feature components
- **Context Providers**: Global state management for different domains
- **Custom Hooks**: Encapsulated logic for data fetching and state management

## State Management

The application uses React Context for global state management:

- **AuthContext**: User authentication and profile state
- **EventContext**: Event data and operations
- **VenueContext**: Venue information and bookings
- **AthletesContext**: Athlete profiles and following
- **CommunityContext**: Community posts and interactions
- **LeaderboardContext**: Rankings and achievements
- **SocketContext**: Real-time communication state
- **ThemeProvider**: UI theme preferences

## Form Validation

Forms use React Hook Form with Zod schemas for validation:

- Client-side validation with immediate feedback
- Type-safe form handling
- Consistent error messaging
- Accessible form components
