import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://livetalk-backend.onrender.com");
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineUsers: [],
  socket: null,
  CheckAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      console.log("Checking authentication...");
      console.log("Current authUser state:", get().authUser);

      // Check if token exists in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        set({ authUser: null, isCheckingAuth: false });
        return;
      }

      const res = await axiosInstance.get("/auth/check");
      console.log("Auth check successful:", res.data);
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.error(
        "Auth check failed:",
        error.response?.status,
        error.response?.data,
      );
      if (error.response && error.response.status === 401) {
        // Clear token on auth failure
        localStorage.removeItem("token");
        console.log("Token cleared due to auth failure");
        set({ authUser: null, isCheckingAuth: false });
        // Optionally disconnect socket if exists
        if (get().socket) {
          get().socket.off();
          get().socket.disconnect();
          set({ socket: null });
        }
      } else {
        console.error("Error checking authentication:", error);
        set({ authUser: null, isCheckingAuth: false });
      }
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
      console.log("Attempting login...");
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login response:", res.data);
      console.log("Login response headers:", res.headers);
      console.log("Login response status:", res.status);

      // Store token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Token stored in localStorage");
      }

      set({ authUser: res.data, isLoggingIn: false });
      toast.success("Logged in successfully");

      // Connect socket immediately after login
      setTimeout(() => {
        try {
          console.log("Connecting socket after login...");
          get().connectSocket();
        } catch (socketError) {
          console.error("Socket connection error:", socketError);
          toast.error("Failed to connect to socket");
        }
      }, 1000); // Reduced delay since we're using token now
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
        // Clear token from localStorage
        localStorage.removeItem("token");
        console.log("Token removed from localStorage");

        // Disconnect socket and remove all listeners if it exists
        if (get().socket) {
          get().socket.off(); // Remove all listeners
          get().socket.disconnect();
          set({ socket: null });
        }
        set({ authUser: null });
        toast.success("Logged out successfully!");
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
      withCredentials: true,
    });
    socket.connect();
    set({ socket: socket });

    // Global listener for message status updates
    socket.on("messageStatusUpdated", ({ messageId, status }) => {
      const statusOrder = { sent: 1, delivered: 2, seen: 3 };

      // ✅ CORRECTED: only get the state values from `getState()`
      const { messages, recentMessages } = useChatStore.getState();

      // ✅ NEW: use Zustand's `setState` method to update store
      const setChatStore = useChatStore.setState;

      const updatedMessages = messages.map((msg) =>
        msg._id === messageId && statusOrder[status] > statusOrder[msg.status]
          ? { ...msg, status }
          : msg,
      );
      const updatedRecentMessages = Object.fromEntries(
        Object.entries(recentMessages).map(([userId, msg]) => [
          userId,
          msg._id === messageId && statusOrder[status] > statusOrder[msg.status]
            ? { ...msg, status }
            : msg,
        ]),
      );
      // ✅ FIXED: use `setChatStore()` instead of invalid `set`
      setChatStore({
        messages: updatedMessages,
        recentMessages: updatedRecentMessages,
      });
    });
    // Global listener for typing events
    socket.on("typing", ({ senderId }) => {
      const { setTyping } = useChatStore.getState();
      setTyping(senderId);
    });
    socket.on("stopTyping", ({ senderId }) => {
      const { setStopTyping } = useChatStore.getState();
      setStopTyping(senderId);
    });

    socket.on("getOnlineUsers", async (userIds) => {
      set({ onlineUsers: userIds });
      // Emit delivery for all undelivered messages
      const { authUser } = get();
      if (!authUser) return;
      try {
        console.log("User came online, fetching undelivered messages...");
        const res = await axiosInstance.get("/messages/undelivered/all");
        const undelivered = res.data;
        console.log("Found", undelivered.length, "undelivered messages");
        undelivered.forEach((msg) => {
          console.log(
            "Emitting messageDelivered for message:",
            msg._id,
            "from sender:",
            msg.senderId,
          );
          socket.emit("messageDelivered", {
            messageId: msg._id,
            senderId: msg.senderId,
          });
        });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          set({ authUser: null });
          if (get().socket) {
            get().socket.off();
            get().socket.disconnect();
            set({ socket: null });
          }
        } else {
          console.error("Error fetching undelivered messages:", err);
        }
      }
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.off(); // Remove all listeners
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
