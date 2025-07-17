import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  CheckAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data, isCheckingAuth: false });
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
      } else {
        toast.error("Logout failed.");
      }
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error(err.response?.data?.message || "Logout failed.");
    }
  },
}));
