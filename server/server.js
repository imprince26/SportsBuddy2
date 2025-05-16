import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import morgan from "morgan";
import { createServer } from "http";
import authRoute from "./routes/authRoute.js";
import eventRoute from "./routes/eventRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import userRoute from "./routes/userRoute.js";
import connectDB from "./config/db.js";
import setupSocket from "./config/socket.js";
import { uploadImage,upload } from "./config/cloudinary.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io
const io = setupSocket(httpServer);
app.set("io", io); // Make io available in routes

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);
app.use("/api/users", userRoute);
app.use("/api/upload", uploadRoute);

app.post("/api/upload",upload.array("file"),async (req, res) => {
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

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   // Handle multer-specific errors
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({
//       success: false,
//       message: `Upload error: ${err.message}`,
//     });
//   }
//   res.status(500).json({
//     success: false,
//     message: err.message || "Something went wrong!",
//   });
// });

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});