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
  : [
      "http://localhost:3001",
      "https://fiver-frontend.vercel.app",
      "https://fiver-frontend-foxxys-projects.vercel.app",
      "https://fiver-frontend-ramwastaken-foxxys-projects.vercel.app",
    ]; // Fallback to local and production frontend

// ✅ 2️⃣ Set up CORS properly
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked CORS request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies & auth headers
  })
);

// ✅ 3️⃣ Middleware for handling JSON requests & cookies
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Handle form submissions properly
app.use(cookieParser()); // Parse cookies

// ✅ 4️⃣ Serve static files for uploads
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// ✅ 5️⃣ Debugging middleware to log incoming requests (for troubleshooting)
app.use((req, res, next) => {
  console.log("🔍 Request Debugging:");
  console.log("➡️ Origin:", req.headers.origin);
  console.log("➡️ Path:", req.path);
  console.log("➡️ Method:", req.method);
  console.log("➡️ Cookies:", req.cookies); // Logs cookies for debugging
  console.log("➡️ Headers:", req.headers);
  next();
});

// ✅ 6️⃣ Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ 7️⃣ Test route to verify server is running
app.get("/test", (req, res) => {
  res.send("✅ Server is working!");
});

// ✅ 8️⃣ Catch-all error handler for CORS
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy does not allow this origin." });
  } else {
    next(err);
  }
});

// ✅ 9️⃣ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
