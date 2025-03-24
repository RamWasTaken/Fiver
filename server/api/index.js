import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http"; // ✅ Added for WebSockets
import { Server } from "socket.io"; // ✅ Added for WebSockets
import cookieParser from "cookie-parser";
import authRoutes from "../routes/AuthRoutes.js";
import { gigRoutes } from "../routes/GigRoutes.js";
import { orderRoutes } from "../routes/OrderRoutes.js";
import { messageRoutes } from "../routes/MessageRoutes.js";
import { dashboardRoutes } from "../routes/DashboardRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default port

// ✅ Create an HTTP server to work with Socket.io
const server = createServer(app);

// ✅ Define allowed frontend origins
const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",") // Support multiple origins
  : [
      "http://localhost:3001",
      "https://fiver-frontend-git-version-3-foxxys-projects.vercel.app",
      "https://fiver-frontend.vercel.app",
      "https://fiver-frontend-foxxys-projects.vercel.app",
      "https://fiver-frontend-ramwastaken-foxxys-projects.vercel.app",
    ];

// ✅ Set up CORS to allow requests from frontend
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware for handling JSON requests & cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ✅ Serve static files for image uploads
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// ✅ Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log("🔍 Request Debugging:");
  console.log("➡️ Origin:", req.headers.origin);
  console.log("➡️ Path:", req.path);
  console.log("➡️ Method:", req.method);
  console.log("➡️ Cookies:", req.cookies);
  console.log("➡️ Headers:", req.headers);
  next();
});

// ✅ Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Simple test route to check if server is running
app.get("/test", (req, res) => {
  res.send("✅ Server is working!");
});

// ✅ Catch-all error handler for CORS
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy does not allow this origin." });
  } else {
    next(err);
  }
});

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle incoming messages
  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // Broadcast message to all users
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected : ${socket.id}`);
  });
});

// ✅ Start server with WebSockets
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
