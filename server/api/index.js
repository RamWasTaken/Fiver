import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import multer from "multer";
import supabase from "./supabase.js";

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

const upload = multer({ storage: multer.memoryStorage() });

/** ✅ Route to upload a profile image to Supabase */
app.post("/set-user-image", upload.single("profile"), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!req.file || !userId) {
      return res.status(400).json({ error: "Missing file or userId" });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `profiles/${userId}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (error) throw error;

    const { publicUrl } = supabase.storage.from("profile-images").getPublicUrl(fileName);
    return res.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

/** ✅ Route to retrieve a user's profile image URL from Supabase */
app.get("/get-user-info/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/profile-images/profiles/${userId}.jpg`;

    return res.json({ imageUrl });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Failed to retrieve image" });
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

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { createServer } from "http"; // ✅ Added for WebSockets
// import { Server } from "socket.io"; // ✅ Added for WebSockets
// import cookieParser from "cookie-parser";
// import authRoutes from "../routes/AuthRoutes.js";
// import { gigRoutes } from "../routes/GigRoutes.js";
// import { orderRoutes } from "../routes/OrderRoutes.js";
// import { messageRoutes } from "../routes/MessageRoutes.js";
// import { dashboardRoutes } from "../routes/DashboardRoutes.js";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000; // Default port

// // ✅ Create an HTTP server to work with Socket.io
// const server = createServer(app);

// // ✅ Define allowed frontend origins
// const allowedOrigins = process.env.ORIGIN
//   ? process.env.ORIGIN.split(",") // Support multiple origins
//   : [
//       "http://localhost:3001",
//       "https://fiver-frontend-git-version-3-foxxys-projects.vercel.app",
//       "https://fiver-frontend.vercel.app",
//       "https://fiver-frontend-foxxys-projects.vercel.app",
//       "https://fiver-frontend-ramwastaken-foxxys-projects.vercel.app",
//     ];

// // ✅ Set up CORS to allow requests from frontend
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// // ✅ Middleware for handling JSON requests & cookies
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(cookieParser());

// // ✅ Serve static files for image uploads
// app.use("/uploads", express.static("uploads"));
// app.use("/uploads/profiles", express.static("uploads/profiles"));

// // ✅ Debugging middleware to log incoming requests
// app.use((req, res, next) => {
//   console.log("🔍 Request Debugging:");
//   console.log("➡️ Origin:", req.headers.origin);
//   console.log("➡️ Path:", req.path);
//   console.log("➡️ Method:", req.method);
//   console.log("➡️ Cookies:", req.cookies);
//   console.log("➡️ Headers:", req.headers);
//   next();
// });

// // ✅ Register API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/gigs", gigRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// // ✅ Simple test route to check if server is running
// app.get("/test", (req, res) => {
//   res.send("✅ Server is working!");
// });

// // ✅ Catch-all error handler for CORS
// app.use((err, req, res, next) => {
//   if (err.message === "Not allowed by CORS") {
//     res.status(403).json({ error: "CORS policy does not allow this origin." });
//   } else {
//     next(err);
//   }
// });

// // ✅ Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   transports: ["websocket", "polling"], // ✅ Allow both transports
// });

// io.on("connection", (socket) => {
//   console.log(`✅ User connected: ${socket.id}`);

//   // Handle incoming messages
//   socket.on("send_message", (data) => {
//     io.emit("receive_message", data); // Broadcast message to all users
//   });

//   // Handle user disconnect
//   socket.on("disconnect", () => {
//     console.log(`❌ User disconnected : ${socket.id}`);
//   });
// });

// // ✅ Start server with WebSockets
// server.listen(port, () => {
//   console.log(`🚀 Server running on http://localhost:${port}`);
// });

// export default app;
