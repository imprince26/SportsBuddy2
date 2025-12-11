# SportsBuddy

A full-stack sports event management platform built with the MERN stack, enabling users to create, discover, and participate in sports events while connecting with fellow athletes.

---

## Project Overview

SportsBuddy is a comprehensive web application that brings together athletes, event organizers, and sports enthusiasts. The platform provides tools for event management, community building, venue discovery, and real-time communication—all with a modern, responsive interface.

---

## Key Features

### Authentication & Security
Secure user authentication system with industry-standard practices. Users can register, login, and manage their profiles with complete security. The platform uses JWT tokens stored in HTTP-only cookies to prevent XSS attacks, bcrypt for password hashing, and implements multi-tier rate limiting through Upstash Redis to protect against brute force attacks and API abuse. Role-based access control separates regular users from administrators.

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Multi-tier rate limiting via Upstash Redis (global, auth, API, uploads)
- Role-based access control (User/Admin)

### Event Management
The core feature of SportsBuddy—a complete event lifecycle management system. Users can create sports events with detailed information including sport type, location, date/time, skill level requirements, and participant limits. Event creators can upload multiple images, define custom rules, and specify required equipment. Participants can join events, and once joined, they gain access to a real-time chat room to coordinate with other participants.

- Full CRUD operations for sports events
- Multi-image uploads via Cloudinary
- Event types: Casual, Tournament, Training
- Participant management with capacity limits
- Real-time event chat with Socket.io
- Custom rules and equipment lists

### Venue System
Discover and explore sports venues in your area. Each venue profile includes comprehensive details such as available amenities, pricing information, operating hours, and location data. Users can rate and review venues based on their experiences, helping others make informed decisions. Administrators can add and manage venue listings to keep the directory up-to-date.

- Venue discovery with filtering options
- Rating and review system
- Venue details (amenities, pricing, hours, location)
- Admin venue management

### Community Features
Build and join sports communities centered around specific sports, locations, or interests. Community creators can set descriptions, rules, and manage membership. Members can create posts, share updates, and engage through likes and comments. This feature fosters long-term connections between athletes beyond individual events.

- Create and manage sports communities
- Post creation with likes and comments
- Member management and community roles
- Community-specific content feeds

### Real-time Communication
Seamless real-time messaging powered by Socket.io WebSocket technology. Each event has its own dedicated chat room where participants can communicate instantly. The system shows typing indicators so users know when others are composing messages, displays join/leave notifications to track participant activity, and supports emoji reactions for expressive communication.

- Event chat rooms powered by Socket.io
- Typing indicators and user presence
- Join/leave notifications
- Emoji support in messages

### Leaderboard & Achievements
A gamification system that rewards active participation. Users earn points for creating events, joining events, and engaging with the community. The leaderboard ranks users based on their accumulated points, while achievement badges recognize specific milestones like "Creator" for organizing events, "Team Player" for frequent participation, and "Enthusiast" for community engagement.

- Points-based ranking system
- Achievement badges (Creator, Team Player, Enthusiast, etc.)
- User statistics tracking
- Progress milestones

### Notifications
Stay informed with a comprehensive notification system. Real-time in-app notifications alert users to event updates, new participants, chat messages, and community activity. Important notifications are also sent via email using professionally designed templates. Administrators can send bulk notifications to announce platform-wide updates or important information.

- Real-time notifications via Socket.io
- Email notifications with Nodemailer
- Bulk notification system for admins
- Mark as read functionality

### Admin Dashboard
A powerful administrative interface for platform management. Admins can search, filter, and manage user accounts, moderate events and venues, and monitor platform health through analytics dashboards. The system can generate PDF reports for data analysis, and bulk notification tools enable efficient communication with the entire user base.

- User management with search and filters
- Event and venue moderation
- Platform statistics and analytics
- PDF report generation with PDFKit
- Bulk notification dispatch

---

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization
- **Socket.io Client** for real-time features
- **Axios** for HTTP requests
- **React Router v6** for navigation

### Backend
- **Node.js** with **Express 5**
- **MongoDB** with **Mongoose**
- **Socket.io** for WebSocket communication
- **JWT** + **bcrypt** for authentication
- **Cloudinary** for media storage
- **Nodemailer** for email services
- **Upstash Redis** for rate limiting
- **PDFKit** for report generation
- **Zod** for server-side validation

<!-- ### Mobile (Expo)
- **React Native** with **Expo Router**
- **NativeWind** (Tailwind for React Native)
- **TypeScript** -->

---

## Live Demo & Repository

- **Live Demo:** [SportsBuddy](https://sports-buddy2.vercel.app)
- **GitHub:** [github.com/imprince26/SportsBuddy2](https://github.com/imprince26/SportsBuddy2)

---

**Developed by [Prince Patel](https://github.com/imprince26)**
