import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, Users, Shield, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>
          KimConnect LiveTalk – Real-Time Chat App for Students & Startups
        </title>
        <meta
          name="description"
          content="KimConnect LiveTalk is a modern real-time chat app built with the MERN stack and WebSockets. Create study groups, startup communities, and stay connected across devices."
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="KimConnect LiveTalk – Real-Time Chat App for Students & Startups"
        />
        <meta
          property="og:description"
          content="Host real-time conversations for students, startups, and communities with KimConnect LiveTalk, a MERN-based chat platform."
        />
        <meta
          property="og:url"
          content="https://livetalk-frontend-chat-app-using-mern.onrender.com/landing"
        />
        <meta property="og:image" content="/avatar.png" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="KimConnect LiveTalk – Real-Time Chat App for Students & Startups"
        />
        <meta
          name="twitter:description"
          content="Create and join real-time chat spaces for your classes, startup teams, and communities."
        />
        <meta name="twitter:image" content="/avatar.png" />
      </Helmet>

      <main className="min-h-screen bg-base-200 pt-20">
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Hero text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <MessageSquare className="w-4 h-4" />
                Real-time messaging for communities
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Stay connected with{" "}
                <span className="text-primary">KimConnect LiveTalk</span>
              </h1>
              <p className="text-base-content/70 text-lg">
                Build chat spaces for your study groups, startup teams, and
                communities across Africa and beyond. Instant messaging, modern
                UI, and a fast MERN + WebSockets backend.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="btn btn-primary gap-2">
                  Get started for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Already have an account? Log in
                </Link>
              </div>
              <p className="text-sm text-base-content/60">
                No credit card required. Designed for students, bootcamps, and
                early-stage founders.
              </p>
            </div>

            {/* Side card */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    Built for real-time conversations
                  </h2>
                  <p className="text-sm text-base-content/70">
                    Powered by the MERN stack and WebSockets.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Communities</h3>
                  <p className="text-xs text-base-content/70">
                    Organize conversations for classes, cohorts, and startup
                    teams.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Privacy-first</h3>
                  <p className="text-xs text-base-content/70">
                    Secure authentication and profile controls for every user.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Fast & modern</h3>
                  <p className="text-xs text-base-content/70">
                    Smooth, responsive chat experience on desktop and mobile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
};

export default LandingPage;
