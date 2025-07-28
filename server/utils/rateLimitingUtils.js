import {rateLimit,ipKeyGenerator } from "express-rate-limit";

// Safe key generator that handles IPv6 addresses properly
// export const createSafeKeyGenerator = () => {
//   return (req, res) => {
//     // If user is authenticated, use user ID
//     if (req.user?.id) {
//       return `user:${req.user.id}`;
//     }
    
//    return req.ip.replace(/:/g, '-'); // Replace colons in IPv6 addresses
//   };
// };

// Enhanced rate limiting factory with v7+ compatibility
export const createRateLimit = (windowMs, max, message, options = {}) => {
  const {
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    skipIf = null,
    enableLogging = true
  } = options;

  const rateLimitConfig = {
    windowMs,
    limit: max, // Changed from 'max' to 'limit' for v7+ compatibility
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: 'draft-7', // Use the latest draft standard
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    
    // Custom handler that replaces onLimitReached functionality
    handler: (req, res, next, options) => {
      // Log when rate limit is first exceeded (replaces onLimitReached)
      if (enableLogging && req.rateLimit.used === req.rateLimit.limit + 1) {
        console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`, {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id || 'anonymous',
          limit: req.rateLimit.limit,
          used: req.rateLimit.used,
          remaining: req.rateLimit.remaining,
          resetTime: new Date(req.rateLimit.resetTime),
          timestamp: new Date().toISOString()
        });
      }

      // Send the rate limit exceeded response
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        limit: req.rateLimit.limit,
        used: req.rateLimit.used,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString(),
        windowMs,
        timestamp: new Date().toISOString()
      });
    },
    
    keyGenerator: (req, res) => {
      // If user is authenticated, use user ID
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
        // Otherwise, use the IP address (replace colons for IPv6 compatibility)
        return ipKeyGenerator(req.ip);
    },
    
    // Add request info to all requests
    requestWasSuccessful: (req, res) => {
      return res.statusCode < 400;
    }
  };

  // Only add skip function if skipIf is provided and is a function
  if (skipIf && typeof skipIf === 'function') {
    rateLimitConfig.skip = skipIf;
  }

  return rateLimit(rateLimitConfig);
};

// Predefined rate limiters with updated configuration
export const rateLimiters = {
  global: createRateLimit(
    30 * 60 * 1000,
    1000,
    "Too many requests from this IP/user, please try again later.",
    { enableLogging: true }
  ),
  
  auth: createRateLimit(
    30 * 60 * 1000,
    10,
    "Too many authentication attempts, please try again later.",
    { 
      skipSuccessfulRequests: false,
      enableLogging: true
    }
  ),
  
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    300,
    "Too many API requests, please try again later.",
    { enableLogging: true }
  ),
  
  upload: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    20,
    "Too many upload requests, please try again later.",
    { enableLogging: true }
  ),
  
  admin: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    500,
    "Too many admin requests, please try again later.",
    { 
      enableLogging: true,
      skipIf: (req, res) => {
        // Skip for super admin in production
        return req.user?.role === 'superadmin';
      }
    }
  ),
  
  search: createRateLimit(
    1 * 60 * 1000, // 1 minute
    30,
    "Too many search requests, please slow down.",
    { enableLogging: true }
  ),

//   // Password reset specific limiter
//   passwordReset: createAdvancedRateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     limit: 3,
//     message: "Too many password reset attempts",
//     skipSuccessfulRequests: false,
//     enableLogging: true
//   }),

//   // Email verification limiter
//   emailVerification: createAdvancedRateLimit({
//     windowMs: 5 * 60 * 1000, // 5 minutes
//     limit: 3,
//     message: "Too many email verification requests",
//     skipSuccessfulRequests: true,
//     enableLogging: true
//   })
};

// Utility function for dynamic rate limiting based on user type
// export const createUserBasedRateLimit = (guestLimit, userLimit, adminLimit) => {
//   return (req, res, next) => {
//     const userRole = req.user?.role || 'guest';
    
//     let limit;
//     switch (userRole) {
//       case 'admin':
//         limit = adminLimit;
//         break;
//       case 'user':
//         limit = userLimit;
//         break;
//       default:
//         limit = guestLimit;
//     }

//     const dynamicLimiter = createAdvancedRateLimit({
//       windowMs: 15 * 60 * 1000,
//       limit,
//       message: `Too many requests for ${userRole} role`,
//       enableLogging: true
//     });

//     dynamicLimiter(req, res, next);
//   };
// };

// // Utility for creating role-specific rate limiters
// export const createRoleBasedRateLimit = (roleConfig = {}) => {
//   const defaultConfig = {
//     guest: { limit: 50, windowMs: 15 * 60 * 1000 },
//     user: { limit: 200, windowMs: 15 * 60 * 1000 },
//     admin: { limit: 500, windowMs: 15 * 60 * 1000 },
//     superadmin: { limit: 1000, windowMs: 15 * 60 * 1000 }
//   };

//   const config = { ...defaultConfig, ...roleConfig };

//   return (req, res, next) => {
//     const userRole = req.user?.role || 'guest';
//     const roleConfig = config[userRole] || config.guest;

//     const limiter = createAdvancedRateLimit({
//       windowMs: roleConfig.windowMs,
//       limit: roleConfig.limit,
//       message: `Rate limit exceeded for ${userRole} role`,
//       enableLogging: true
//     });

//     limiter(req, res, next);
//   };
// };