import { Server } from "socket.io";
import Message from "../models/message.model.js";

let io;
const userSocketMap = {}; // { userId: [socketId, ...] }

export function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "https://livetalk-frontend-chat-app-using-mern.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Helper to emit to all sockets of a user
  function emitToUser(userId, event, data) {
    (userSocketMap[userId] || []).forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
  io.emitToUser = emitToUser;

  io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
      if (!userSocketMap[userId]) userSocketMap[userId] = [];
      userSocketMap[userId].push(socket.id);
    }
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Emit delivery status for all messages sent to this user that are still in 'sent' status
    if (userId) {
      Message.find({ receiverId: userId, status: "sent" })
        .then((messages) => {
          console.log(
            `Found ${messages.length} undelivered messages for user ${userId}`
          );
          messages.forEach((message) => {
            emitToUser(message.senderId, "messageStatusUpdated", {
              messageId: message._id,
              status: "delivered",
            });
          });
        })
        .catch((err) => {
          console.error("Error finding undelivered messages:", err);
        });
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
      console.log("Client disconnected: ", socket.id);
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId] = userSocketMap[userId].filter(
          (id) => id !== socket.id
        );
        if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("messageDelivered", async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "delivered" });
        emitToUser(senderId, "messageStatusUpdated", {
          messageId,
          status: "delivered",
        });
      } catch (err) {
        console.error("Error updating message to delivered:", err);
      }
    });

    socket.on("messageSeen", async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "seen" });
        emitToUser(senderId, "messageStatusUpdated", {
          messageId,
          status: "seen",
        });
      } catch (err) {
        console.error("Error updating message to seen:", err);
      }
    });

    socket.on("typing", ({ receiverId, senderId }) => {
      emitToUser(receiverId, "typing", { senderId });
    });

    socket.on("stopTyping", ({ receiverId, senderId }) => {
      emitToUser(receiverId, "stopTyping", { senderId });
    });
  });
}

export { io };
