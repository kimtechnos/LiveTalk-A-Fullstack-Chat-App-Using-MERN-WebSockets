import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  isMessagesLoading: false,
  isUsersLoading: false,
  selectedUser: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data, isUsersLoading: false });
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      set({ messages: [...messages, res.data] });

      // Emit the new message to the socket server
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("newMessage", res.data);
      }
      // try {
      //   const res = await axiosInstance.post(
      //     `/messages/send/${selectedUser._id}`,
      //     messageData,
      //   );
      //   set({ messages: [...messages, res.data] });

      //   // Emit the new message to the socket server
      //   const socket = useAuthStore.getState().socket;
      //   if (socket) {
      //     socket.emit("newMessage", res.data);
      //   }
    } catch (error) {
      console.error(error.response?.data?.message);
      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  //later
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
