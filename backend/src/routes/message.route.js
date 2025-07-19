import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  getUndeliveredMessages,
} from "../controllers/message.contrller.js";
const router = express.Router();
// Get users for sidebar
router.get("/users", protectRoute, getUsersForSidebar);
// Get messages between two users
router.get("/:id", protectRoute, getMessages);
// Send a message to a user
router.post("/send/:id", protectRoute, sendMessage);
// Get undelivered messages for the current user
router.get("/undelivered/all", protectRoute, getUndeliveredMessages);
export default router;
