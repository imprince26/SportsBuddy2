import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
      let SportsBuddyToken;
        
        // Get SportsBuddyToken from cookies or authorization header
        if (req.cookies.SportsBuddyToken) {
            SportsBuddyToken = req.cookies.SportsBuddyToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            SportsBuddyToken = req.headers.authorization.split(' ')[1];
        }
        
        // If no SportsBuddyToken, return error
        if (!SportsBuddyToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

    const decoded = jwt.verify(SportsBuddyToken, process.env.JWT_SECRET);

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
