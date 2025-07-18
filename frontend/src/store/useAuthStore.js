import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  CheckAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data, isSigningUp: false });
      toast.success("Account created successfully");
      // Optionally redirect to home or login page
      get().connectSocket();
    } catch (error) {
      toast.error("Failed to create account");
      console.error("Error signing up:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, isLoggingIn: false });
      toast.success("Logged in successfully");
      try {
        get().connectSocket();
      } catch (socketError) {
        console.error("Socket connection error:", socketError);
        toast.error("Failed to connect to socket");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      const data = res?.data;
      console.log("Logout response:", res.data);

      if (data?.success) {
        set({ authUser: null });
        toast.success("Logged out successfully!");
        // Disconnect socket if it exists
        get().disconnectSocket();
      } else {
        toast.error("Logout failed.");
      }
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error(err.response?.data?.message || "Logout failed.");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data, isUpdatingProfile: false });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    // Global listener for message status updates
    socket.on("messageStatusUpdated", ({ messageId, status }) => {
      const { messages, set, recentMessages } = useChatStore.getState();
      set({
        messages: messages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg,
        ),
        recentMessages: Object.fromEntries(
          Object.entries(recentMessages).map(([userId, msg]) => [
            userId,
            msg._id === messageId ? { ...msg, status } : msg,
          ]),
        ),
      });
    });

    socket.on("getOnlineUsers", async (userIds) => {
      set({ onlineUsers: userIds });
      // Emit delivery for all undelivered messages
      const { authUser } = get();
      if (!authUser) return;
      try {
        const res = await axiosInstance.get("/messages/undelivered/all");
        const undelivered = res.data;
        undelivered.forEach((msg) => {
          socket.emit("messageDelivered", {
            messageId: msg._id,
            senderId: msg.senderId,
          });
        });
      } catch (err) {
        // Optionally handle error
      }
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
