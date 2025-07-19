import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {}; // Map to store userId and their corresponding socketId
// Handle socket connection
io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id; // Store the socketId for the userId
  console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  //io.emit() is used to emit events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // Listen for disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
    // Remove the userId from the map when the socket disconnects
    delete userSocketMap[userId];
    // Emit the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Listen for message delivery
  socket.on("messageDelivered", async ({ messageId, senderId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId,
          status: "delivered",
        });
      }
    } catch (err) {
      console.error("Error updating message to delivered:", err);
    }
  });

  // Listen for message seen
  socket.on("messageSeen", async ({ messageId, senderId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "seen" });
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId,
          status: "seen",
        });
      }
    } catch (err) {
      console.error("Error updating message to seen:", err);
    }
  });
});

export { io, app, server };
