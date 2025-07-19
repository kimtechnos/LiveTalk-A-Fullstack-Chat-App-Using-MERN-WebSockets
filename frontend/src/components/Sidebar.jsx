import React from "react";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Check, CheckCheck } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    recentMessages,
    typingUsers,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  useEffect(() => {
    getUsers();
  }, [getUsers]);
  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="aspect-square w-20 sm:w-20 rounded-full object-cover"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900 hidden lg:inline-block"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="text-left min-w-0 flex flex-col">
              {/* Show full name on all screens */}
              <div className="font-medium truncate text-sm sm:text-base">
                {user.fullName}
              </div>
              {/* Last message and ticks */}
              <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                {recentMessages[user._id] && (
                  <>
                    <span className="truncate max-w-[100px]">
                      {recentMessages[user._id].text ||
                        (recentMessages[user._id].image ? "[Image]" : "")}
                    </span>
                    {/* Only show ticks if the last message was sent by the current user */}
                    {recentMessages[user._id].senderId ===
                      useAuthStore.getState().authUser?._id && (
                      <span className="ml-1 flex items-center">
                        {recentMessages[user._id].status === "sent" && (
                          <Check size={14} className="text-gray-400" />
                        )}
                        {recentMessages[user._id].status === "delivered" && (
                          <CheckCheck size={14} className="text-gray-400" />
                        )}
                        {recentMessages[user._id].status === "seen" && (
                          <CheckCheck size={14} className="text-blue-500" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
              {/* Show 'Online' text on lg and up, icon only on smaller screens */}
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                {typingUsers.includes(user._id) ? (
                  <span className="italic text-xs text-blue-500">
                    typing...
                  </span>
                ) : onlineUsers.includes(user._id) ? (
                  <>
                    <span className="lg:inline hidden">Online</span>
                    <span className="inline lg:hidden w-2 h-2 rounded-full bg-green-500"></span>
                  </>
                ) : (
                  <>
                    <span className="lg:inline hidden">Offline</span>
                    <span className="inline lg:hidden w-2 h-2 rounded-full bg-gray-400"></span>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
