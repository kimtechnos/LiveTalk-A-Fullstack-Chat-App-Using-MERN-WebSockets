import React from "react";
import { Helmet } from "react-helmet-async";
import { useChatStore } from "../store/useChatStore";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <React.Fragment>
      <Helmet>
        <title>
          KimConnect LiveTalk – Real-Time Chat Dashboard for Students, Startups
          & Communities
        </title>
        <meta
          name="description"
          content="Open your KimConnect LiveTalk dashboard to chat in real time, manage conversations, and stay connected with friends, classmates, startups, and communities in Africa and beyond."
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="KimConnect LiveTalk – Real-Time Chat Dashboard"
        />
        <meta
          property="og:description"
          content="Chat in real time with classmates, startups, and communities using the KimConnect LiveTalk dashboard."
        />
        <meta
          property="og:url"
          content="https://livetalk-frontend-chat-app-using-mern.onrender.com/"
        />
        <meta property="og:image" content="/avatar.png" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="KimConnect LiveTalk – Real-Time Chat Dashboard"
        />
        <meta
          name="twitter:description"
          content="Open your KimConnect LiveTalk dashboard to manage your real-time conversations."
        />
        <meta name="twitter:image" content="/avatar.png" />
      </Helmet>

      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar />

              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default HomePage;
