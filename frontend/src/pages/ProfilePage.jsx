import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import { Helmet } from "react-helmet-async";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImage] = React.useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImage(null);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>Profile – Manage Your KimConnect LiveTalk Account</title>
        <meta
          name="description"
          content="View and update your KimConnect LiveTalk profile, avatar, and account details to personalize your real-time chat experience with classmates, startups, and communities."
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Profile – Manage Your KimConnect LiveTalk Account"
        />
        <meta
          property="og:description"
          content="Manage your KimConnect LiveTalk profile, avatar, and account details to personalize your real-time chat experience."
        />
        <meta
          property="og:url"
          content="https://livetalk-frontend-chat-app-using-mern.onrender.com/profile"
        />
        <meta property="og:image" content="/avatar.png" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Profile – Manage Your KimConnect LiveTalk Account"
        />
        <meta
          name="twitter:description"
          content="View and update your KimConnect LiveTalk profile and account details for a personalized chat experience."
        />
        <meta name="twitter:image" content="/avatar.png" />
      </Helmet>

      <div className="h-screen pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold ">Profile</h1>
              <p className="mt-2">Your profile information</p>
            </div>

            {/* avatar upload section */}

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 "
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to update your photo"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.fullName}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.email}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium  mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProfilePage;
