import { Server } from "socket.io";
import Message from "../models/message.model.js";

let io;
const userSocketMap = {};

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id; // Store the socketId for the userId
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Emit delivery status for all messages sent to this user that are still in 'sent' status
    if (userId) {
      Message.find({ receiverId: userId, status: "sent" })
        .then((messages) => {
          console.log(
            `Found ${messages.length} undelivered messages for user ${userId}`
          );
          messages.forEach((message) => {
            const senderSocketId = userSocketMap[message.senderId];
            if (senderSocketId) {
              io.to(senderSocketId).emit("messageStatusUpdated", {
                messageId: message._id,
                status: "delivered",
              });
            }
          });
        })
        .catch((err) => {
          console.error("Error finding undelivered messages:", err);
        });
    }

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

    // Typing indicator events
    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ receiverId, senderId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId });
      }
    });
  });
}

export { io };
