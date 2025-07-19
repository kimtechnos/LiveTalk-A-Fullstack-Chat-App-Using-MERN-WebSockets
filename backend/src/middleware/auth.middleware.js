import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized. No token provided." });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized. Invalid token payload." });
    }

    // Find the user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized. User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
