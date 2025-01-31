import express from "express";
const app = express();
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

import authRoute from "./routes/authRoute.js";
import eventRoute from "./routes/eventRoute.js";

app.use(cors({
  origin:process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser()); 

app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);

console.log(process.env.CLIENT_URL);
console.log(process.env.NODE_ENV);

mongoose.connect(MONGO_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});