import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    const message =
      error.name === "TokenExpiredError"
        ? "Authentication token expired. Please log in again."
        : "Invalid authentication token.";
    res.status(401).json({ success: false, message });
  }
};
