import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

function getAuthToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  if (req.cookies?.SportsBuddyToken) {
    return req.cookies.SportsBuddyToken;
  }
  return null;
}

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin verification failed",
      error: error.message,
    });
  }
};
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // If token is invalid, just proceed without user
    next();
  }
};
