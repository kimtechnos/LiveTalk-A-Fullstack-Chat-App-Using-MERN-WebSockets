import React from "react";
import Navbar from "./components/Navbar.jsx";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore.js";
import { Loader } from "lucide-react";
// import {useThemeStore} from "./store/useThemeStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
// import { Toaster } from "react-hot-toast";

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const checkAuth = useAuthStore((state) => state.CheckAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const { theme } = useThemeStore();

  // Restore automatic auth check to keep user logged in after refresh
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  // Set the theme on initial load
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  console.log("authUser", authUser);
  // Restore loading condition while checking authentication
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={authUser ? <HomePage /> : <LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
