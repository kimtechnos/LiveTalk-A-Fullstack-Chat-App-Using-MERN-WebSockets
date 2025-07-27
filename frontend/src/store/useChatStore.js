import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  recentMessages: {}, // { [userId]: lastMessage }
  typingUsers: [], // array of userIds who are currently typing to the current user
  isMessagesLoading: false,
  isUsersLoading: false,
  selectedUser: null,

  getUsers: async () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) {
      console.log("No auth user, skipping getUsers");
      return; // Prevent API call if not authenticated
    }
    console.log("Getting users for auth user:", authUser._id);
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("Users loaded successfully:", res.data.length, "users");
      set({ users: res.data, isUsersLoading: false });
    } catch (error) {
      console.error(
        "Failed to load users:",
        error.response?.status,
        error.response?.data
      );
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) return; // Prevent API call if not authenticated
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Emit seen for all unseen messages from this user
      const { authUser, socket } = useAuthStore.getState();
      if (!authUser || !socket) return;
      res.data.forEach((msg) => {
        if (
          msg.receiverId === authUser._id &&
          msg.senderId === userId &&
          msg.status !== "seen"
        ) {
          socket.emit("messageSeen", {
            messageId: msg._id,
            senderId: msg.senderId,
          });
        }
      });
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages, recentMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({
        messages: [...messages, res.data],
        recentMessages: {
          ...recentMessages,
          [selectedUser._id]: res.data,
        },
      });

      // Emit the new message to the socket server
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("newMessage", res.data);
      }
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error("Failed to send message");
    }
  },

  setTyping: (userId) => {
    set((state) => ({
      typingUsers: [...new Set([...state.typingUsers, userId])],
    }));
  },
  setStopTyping: (userId) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter((id) => id !== userId),
    }));
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    // Remove previous listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("messageStatusUpdated");

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      const { selectedUser } = get();
      const isMessageForCurrentChat =
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === authUser._id) ||
          (newMessage.senderId === authUser._id &&
            newMessage.receiverId === selectedUser._id));
      if (isMessageForCurrentChat) {
        set({
          messages: [...get().messages, newMessage],
        });
        // Emit seen event if the chat is open and the message is for the current user
        if (newMessage.receiverId === authUser._id) {
          socket.emit("messageSeen", {
            messageId: newMessage._id,
            senderId: newMessage.senderId,
          });
        }
      }
      // Update recentMessages for both sender and receiver
      const { recentMessages } = get();
      const chatUserId =
        authUser && newMessage.senderId === authUser._id
          ? newMessage.receiverId
          : newMessage.senderId;
      set({
        recentMessages: {
          ...recentMessages,
          [chatUserId]: newMessage,
        },
      });
    });

    // Listen for message status updates
    socket.on("messageStatusUpdated", ({ messageId, status }) => {
      // Only upgrade status, never downgrade
      const statusOrder = { sent: 1, delivered: 2, seen: 3 };
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId && statusOrder[status] > statusOrder[msg.status]
            ? { ...msg, status }
            : msg
        ),
      });
    });

    // Emit seen event when opening the chat
    const { messages } = get();
    const { authUser } = useAuthStore.getState();
    messages.forEach((msg) => {
      if (
        msg.receiverId === authUser?._id &&
        msg.senderId === selectedUser._id &&
        msg.status !== "seen"
      ) {
        socket.emit("messageSeen", {
          messageId: msg._id,
          senderId: msg.senderId,
        });
      }
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageStatusUpdated");
  },

  //later
  setSelectedUser: (selectedUser) => {
    // Clear all typing indicators when switching chats
    set((state) => ({
      selectedUser,
      typingUsers: [],
    }));
    // Emit seen for all unseen messages from this user
    const { messages } = get();
    const { authUser, socket } = useAuthStore.getState();
    if (!authUser || !socket) return; // Prevent null errors
    messages.forEach((msg) => {
      if (
        msg.receiverId === authUser._id &&
        msg.senderId === selectedUser._id &&
        msg.status !== "seen"
      ) {
        socket.emit("messageSeen", {
          messageId: msg._id,
          senderId: msg.senderId,
        });
      }
    });
    // Optionally, emit stopTyping for previous chat
    // (if you want to ensure the other user doesn't see you as typing)
    // You can add logic here if needed
  },
}));
