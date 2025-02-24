import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "../routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import { gigRoutes } from "../routes/GigRoutes.js";
import { orderRoutes } from "../routes/OrderRoutes.js";
import { messageRoutes } from "../routes/MessageRoutes.js";
import { dashboardRoutes } from "../routes/DashboardRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

// ✅ 1️⃣ Ensure allowed origins are set correctly
const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",") // Allows multiple origins if provided as a comma-separated string
  : ["http://localhost:3001", "https://fiver-frontend.vercel.app","https://fiver-frontend-foxxys-projects.vercel.app",
  "https://fiver-frontend-ramwastaken-foxxys-projects.vercel.app",
  "http://localhost:3001"]; // Fallback to local and production frontend

// ✅ 2️⃣ Set up CORS properly
app.use(
  cors({
    origin: allowedOrigins, // Allow only specified origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed request headers
    credentials: true, // Allow cookies & auth headers
  })
);

// ✅ 3️⃣ Handle preflight OPTIONS requests explicitly
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || allowedOrigins[0]);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204); // No content, just acknowledge the request
});

// ✅ 4️⃣ Debugging middleware to log incoming requests (for troubleshooting)
app.use((req, res, next) => {
  console.log("CORS Debugging:");
  console.log("Origin:", req.headers.origin);
  console.log("Path:", req.path);
  console.log("Method:", req.method);
  next();
});

// ✅ 5️⃣ Middleware for handling JSON requests & cookies
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies

// ✅ 6️⃣ Serve static files for uploads
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// ✅ 7️⃣ Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ 8️⃣ Test route to verify server is running
app.get("/test", (req, res) => {
  res.send("✅ Server is working!");
});

// ✅ 9️⃣ Start server (DO NOT remove unless using a serverless environment)
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
