import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
// NEW: Import routes instead of defining them directly in index.js
import authRoutes from "../routes/AuthRoutes.js";
import { gigRoutes } from "../routes/GigRoutes.js";
import { orderRoutes } from "../routes/OrderRoutes.js";
import { messageRoutes } from "../routes/MessageRoutes.js";
import { dashboardRoutes } from "../routes/DashboardRoutes.js";
// fix authentication frontend , undersand cookie and JWT backend . make frontend responsive and mobile friendly .
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);

const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",")
  : [
      "http://localhost:3001",
      "https://fiver-frontend-git-version-3-foxxys-projects.vercel.app",
      "https://fiver-frontend.vercel.app",
      "https://fiver-frontend-foxxys-projects.vercel.app",
      "https://fiver-frontend-ramwastaken-foxxys-projects.vercel.app",
    ];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// NEW: Moved static file serving from commented code
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// NEW: Added debugging middleware from commented code
app.use((req, res, next) => {
  console.log("🔍 Request Debugging:");
  console.log("➡️ Origin:", req.headers.origin);
  console.log("➡️ Path:", req.path);
  console.log("➡️ Method:", req.method);
  console.log("➡️ Cookies:", req.cookies);
  console.log("➡️ Headers:", req.headers);
  next();
});

// NEW: Registered all API routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

// NEW: Simple test route from commented code
app.get("/test", (req, res) => {
  res.send("✅ Server is working!");
});

// NEW: Added CORS error handler from commented code
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy does not allow this origin." });
  } else {
    next(err);
  }
});

/** ✅ Socket.io setup */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected : ${socket.id}`);
  });
});

/** ✅ Start server with WebSockets */
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;