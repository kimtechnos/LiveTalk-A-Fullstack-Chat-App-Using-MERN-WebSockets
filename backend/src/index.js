import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { setupSocket } from "./lib/socket.js";
import path from "path";

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

setupSocket(server);

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
