import { Router } from "express";
import {
  getUserInfo,
  getUserInfoById,
  login,
  setPublicUserImage,
  setUserImage,
  setUserInfo,
  signup,
} from "../controllers/AuthControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();

// NEW: Using memory storage instead of disk storage for Supabase compatibility
const upload = multer({ storage: multer.memoryStorage() });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);

// NEW: Added route for authenticated user image upload
authRoutes.post("/set-user-image", verifyToken, upload.single("image"), setUserImage);

// NEW: Added route for public user image upload (moved from index.js)
authRoutes.post("/set-public-user-image", upload.single("profile"), setPublicUserImage);

// NEW: Added route to get user info by ID (moved from index.js)
authRoutes.get("/user-info/:userId", getUserInfoById);

authRoutes.get("/", (req, res) => {
  res.send("✅ Auth API is working!");
});

export default authRoutes;