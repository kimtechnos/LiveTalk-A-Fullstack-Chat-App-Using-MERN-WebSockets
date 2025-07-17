import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
export const useAuthStore = create((set) => ({
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
}));
