import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("Auth middleware - cookies:", req.cookies);
    const token = req.cookies?.jwt;

    if (!token) {
      console.log("Auth middleware - No token found");
      return res
        .status(401)
        .json({ message: "Not authorized. No token provided." });
    }

    console.log("Auth middleware - Token found, verifying...");
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.userId;

    if (!userId) {
      console.log("Auth middleware - Invalid token payload");
      return res
        .status(401)
        .json({ message: "Not authorized. Invalid token payload." });
    }

    console.log("Auth middleware - Token verified, finding user:", userId);
    // Find the user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log("Auth middleware - User not found");
      return res
        .status(401)
        .json({ message: "Not authorized. User not found." });
    }

    console.log("Auth middleware - User found:", user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
