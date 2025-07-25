import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ error: "Sender or receiver ID is missing" });
    }

    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "Message must contain text or image" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    // Emit the new message to all sockets of the receiver and the sender
    if (io.emitToUser) {
      io.emitToUser(receiverId.toString(), "newMessage", newMessage);
      io.emitToUser(senderId.toString(), "newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUndeliveredMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    console.log("getUndeliveredMessages called for user:", myId);
    const messages = await Message.find({
      receiverId: myId,
      status: "sent",
    });
    console.log(
      "Found",
      messages.length,
      "undelivered messages for user:",
      myId
    );
    console.log(
      "Undelivered messages:",
      messages.map((m) => ({ id: m._id, senderId: m.senderId, text: m.text }))
    );
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getUndeliveredMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
