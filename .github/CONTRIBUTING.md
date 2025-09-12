# Contributing to SportsBuddy

Thank you for your interest in contributing to SportsBuddy! This document provides comprehensive guidelines for contributing to our sports management platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Component Guidelines](#component-guidelines)

## Code of Conduct

### Our Commitment
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or personal characteristics.

### Expected Behavior
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment, trolling, or discriminatory language
- Personal attacks or insults
- Publishing private information without permission
- Any behavior that would be inappropriate in a professional setting

## Getting Started

### Prerequisites
Before contributing, ensure you have:
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Git for version control
- A code editor (VS Code recommended)
- Basic understanding of React, Express, and MongoDB

### First-Time Contributors
1. Read through this entire contributing guide
2. Set up the development environment
3. Look for issues labeled `good first issue`
4. Ask questions when needed

## Development Setup

### Initial Setup
1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/SportsBuddy2.git
   cd SportsBuddy2
   ```

2. **Install Dependencies**
   ```bash
   # Server dependencies
   cd server
   npm install
   
   # Client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Copy and configure environment files:
   ```bash
   # Server
   cd server
   cp .env.example .env
   
   # Client
   cd ../client
   cp .env.example .env
   ```

4. **Database Setup**
   - Install and start MongoDB locally
   - Create a database named `sportsbuddy`
   - Update connection string in server `.env`

5. **Third-party Services**
   - **Cloudinary**: Sign up for image/file storage
   - **Email Service**: Configure Gmail or preferred email provider
   - Update respective API keys in environment files

### Development Workflow
1. **Start Development Servers**
   ```bash
   # Terminal 1: Server
   cd server
   npm run dev
   
   # Terminal 2: Client
   cd client
   npm run dev
   ```

2. **Verify Setup**
   - Client: http://localhost:3000
   - Server: http://localhost:5000
   - Health Check: http://localhost:5000/health

## Project Architecture

### Frontend Architecture (React + Vite)

```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Shadcn/ui)
│   ├── events/         # Event-specific components
│   ├── athletes/       # Athlete management
│   ├── venues/         # Venue components
│   └── layout/         # Layout components
├── pages/              # Route-level components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── schemas/            # Form validation schemas
```

### Backend Architecture (Express + MongoDB)

```
server/
├── controllers/        # Business logic and route handlers
├── models/            # MongoDB/Mongoose schemas
├── routes/            # API route definitions
├── middleware/        # Express middleware
├── config/           # Configuration modules
├── utils/            # Server utility functions
└── scripts/          # Database and utility scripts
```

### Key Architectural Principles
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Component Reusability**: Modular components with clear interfaces
- **Context Management**: Centralized state management using React Context
- **API Design**: RESTful endpoints with consistent response patterns
- **Error Handling**: Comprehensive error handling at all levels
- **Security**: Authentication, authorization, and input validation

## Coding Standards

### JavaScript/React Standards
- Use ES6+ features and modern JavaScript syntax
- Prefer functional components with hooks over class components
- Use destructuring for props and state variables
- Implement proper error boundaries for React components
- Follow React best practices for performance optimization

### Code Formatting
- Use ESLint configuration provided in the project
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused on single responsibility

### File and Folder Naming
- Use PascalCase for React components (`EventCard.jsx`)
- Use camelCase for utility functions and hooks (`useAuth.js`)
- Use camelCase for regular files (`authMiddleware.js`)
- Use descriptive folder names that reflect their purpose

### Import Organization
```javascript
// 1. React and third-party imports
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Internal imports (components, hooks, utils)
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'

// 3. Relative imports
import './EventCard.css'
```

### API Development Standards
- Use consistent HTTP status codes
- Implement proper error responses with meaningful messages
- Add input validation for all endpoints
- Use middleware for common functionality (auth, rate limiting)
- Document API endpoints with clear parameter descriptions

## Git Workflow

### Branch Naming Convention
```
feature/description       # New features
fix/description          # Bug fixes
docs/description         # Documentation updates
refactor/description     # Code refactoring
test/description         # Testing improvements
chore/description        # Maintenance tasks
```

Examples:
- `feature/event-chat-system`
- `fix/profile-image-upload`
- `docs/api-documentation`

### Commit Message Format
We follow Conventional Commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scopes**:
- `client`: Frontend changes
- `server`: Backend changes
- `api`: API-related changes
- `auth`: Authentication system
- `events`: Event management
- `community`: Community features
- `venues`: Venue management
- `leaderboard`: Leaderboard system

**Examples**:
```
feat(events): add real-time event chat functionality
fix(auth): resolve JWT token expiration handling
docs(api): update authentication endpoint documentation
```

### Development Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, well-commented code
   - Follow coding standards
   - Test your changes thoroughly

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): descriptive commit message"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

### Before Submitting
- Ensure your code follows project coding standards
- Run linting and fix any issues
- Test your changes locally
- Update documentation if necessary
- Verify no breaking changes are introduced

### PR Requirements
1. **Descriptive Title**: Use conventional commit format
2. **Detailed Description**: Explain what changes were made and why
3. **Testing Information**: Describe how changes were tested
4. **Screenshots**: Include screenshots for UI changes
5. **Breaking Changes**: Clearly document any breaking changes

### PR Template Usage
Use the provided PR template and fill out all relevant sections:
- Type of change
- Components modified
- Testing performed
- Database/API changes
- Security considerations

### Review Process
1. **Automated Checks**: All CI/CD checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Verify functionality works as expected
4. **Documentation**: Ensure documentation is updated
5. **Merge**: Squash and merge after approval

## Issue Reporting

### Before Creating an Issue
1. Search existing issues to avoid duplicates
2. Gather relevant information about the bug or feature
3. Test the issue in the latest version
4. Prepare clear reproduction steps

### Issue Types
Use appropriate issue templates:
- **Bug Report**: For reporting bugs and errors
- **Feature Request**: For suggesting new features
- **Documentation**: For documentation improvements
- **Performance**: For performance-related issues

### Bug Report Information
Include the following in bug reports:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment information (browser, OS, versions)
- Screenshots or error messages
- Component/area affected

### Feature Request Information
For feature requests, provide:
- Problem statement the feature would solve
- Proposed solution
- User stories and use cases
- Technical considerations
- Priority level


## Component Guidelines

### React Components
- Keep components focused and single-purpose
- Use props for component configuration
- Implement proper prop validation
- Handle loading and error states
- Make components accessible (ARIA attributes)

### UI Components
- Follow Shadcn/ui patterns for consistency
- Use Tailwind CSS for styling
- Implement responsive design
- Support dark/light theme modes
- Test on multiple screen sizes

### State Management
- Use React Context for global state
- Keep local state minimal
- Use custom hooks for complex state logic
- Implement proper error boundaries
- Handle async operations correctly

## Database Guidelines

### MongoDB Schema Design
- Use meaningful collection and field names
- Implement proper indexing for performance
- Add validation rules in Mongoose schemas
- Use references appropriately
- Consider data growth and scalability

### Migration Scripts
- Create migration scripts for schema changes
- Test migrations on sample data
- Document migration procedures
- Implement rollback procedures
- Coordinate with deployment process

## Security Guidelines

### Authentication & Authorization
- Never store passwords in plain text
- Use JWT tokens appropriately
- Implement proper session management
- Add rate limiting to prevent abuse
- Validate all user inputs

### Data Protection
- Sanitize user inputs
- Use HTTPS in production
- Implement proper CORS configuration
- Secure file upload functionality
- Follow OWASP security guidelines

## Performance Guidelines

### Frontend Performance
- Implement code splitting
- Optimize images and assets
- Use lazy loading where appropriate
- Minimize bundle sizes
- Implement proper caching strategies

### Backend Performance
- Optimize database queries
- Use appropriate indexing
- Implement caching where beneficial
- Monitor response times
- Use compression middleware