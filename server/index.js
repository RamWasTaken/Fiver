// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import authRoutes from "./routes/AuthRoutes.js";
// import cookieParser from "cookie-parser";
// import { gigRoutes } from "./routes/GigRoutes.js";
// import { orderRoutes } from "./routes/OrderRoutes.js";
// import { messageRoutes } from "./routes/MessageRoutes.js";
// import { dashboardRoutes } from "./routes/DashboardRoutes.js";

// dotenv.config();

// const app = express();
// const port = process.env.PORT;

// app.use(
//   cors({
//     origin: [process.env.ORIGIN],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     credentials: true,
//   })
// );

// app.use("/uploads", express.static("uploads"));
// app.use("/uploads/profiles", express.static("uploads/profiles"));

// app.use(cookieParser());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/gigs", gigRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import { gigRoutes } from "./routes/GigRoutes.js";
import { orderRoutes } from "./routes/OrderRoutes.js";
import { messageRoutes } from "./routes/MessageRoutes.js";
import { dashboardRoutes } from "./routes/DashboardRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

// 1️⃣ Set up CORS properly
app.use(
  cors({
    origin: "https://fiver-frontend.vercel.app", // Hardcoded for testing
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Ensure OPTIONS is included
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 2️⃣ Allow preflight requests explicitly
app.options("*", cors()); // Place this **AFTER** app.use(cors()) but **BEFORE** routes

// 3️⃣ Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log("CORS Debugging:");
  console.log("Origin:", req.headers.origin);
  console.log("Path:", req.path);
  console.log("Method:", req.method);
  next();
});

app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

// REMOVE app.listen() and export app instead
export default app;
