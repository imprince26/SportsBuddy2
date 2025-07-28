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
import connectDB from "./config/db.js";
import setupSocket from "./config/socket.js";
import { uploadImage, upload } from "./config/cloudinary.js";
import job from "./utils/cron.js";
import { rateLimiters } from "./utils/rateLimitingUtils.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io
const io = setupSocket(httpServer);
app.set("io", io);

// Trust proxy if behind a reverse proxy (for accurate IP detection)
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

// Apply global rate limiter to all requests
app.use(rateLimiters.global);

if (process.env.NODE_ENV === "production") job.start();

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization","Access-Control-Allow-Origin"],
};
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/events", rateLimiters.api, eventRoute);
app.use("/api/users", rateLimiters.api, userRoute);
app.use('/api/admin', rateLimiters.admin, adminRoute);
app.use('/api/notifications', rateLimiters.api, notificationRoute);
app.use("/api/upload", rateLimiters.upload, uploadRoute);

app.post("/api/upload",rateLimiters.upload, upload.array("file"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const result = await uploadImage(file);
        return result.secure_url;
      })
    );

    res.status(200).json({
      success: true,
      urls: imageUrls,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images",
    });
  }
});

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
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});