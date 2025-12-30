import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import authRoute from "./routes/authRoute.js";
import eventRoute from "./routes/eventRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import notificationRoute from './routes/notificationRoute.js';
import athletesRoute from './routes/athletesRoute.js';
import communityRoute from './routes/communityRoute.js';
import leaderboardRoute from './routes/leaderboardRoute.js';
import venueRoute from './routes/venueRoute.js';

import connectDB from "./config/db.js";
import setupSocket from "./config/socket.js";
import job from "./utils/cron.js";
// import { upstashRateLimiters } from "./config/upstashRateLimiter.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://sports-buddy2.vercel.app",
  "https://sportsbuddy.princepatel.me"
];

// Configure Socket.io
const io = setupSocket(httpServer);
app.set("io", io);

app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// app.use(upstashRateLimiters.global);

if (process.env.NODE_ENV === "production") job.start();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);
app.use("/api/users", userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/notifications', notificationRoute);
app.use("/api/upload",  uploadRoute);
app.use("/api/athletes", athletesRoute);
app.use("/api/community", communityRoute);
app.use("/api/leaderboard", leaderboardRoute);
app.use("/api/venues",  venueRoute);

// Error handling middleware for rate limiting
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Maximum size is 10MB.'
    });
  }
  next(err);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});