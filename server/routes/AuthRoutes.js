import { Router } from "express";
import {
  getUserInfo,
  login,
  setUserImage,
  setUserInfo,
  signup,
} from "../controllers/AuthControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();

// ✅ Updated: Multer storage is now in memory instead of saving locally
const upload = multer({ storage: multer.memoryStorage() });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);

// ✅ Updated: Changed field name to match frontend form data ("image" instead of "images")
authRoutes.post("/set-user-image", verifyToken, upload.single("image"), setUserImage);

authRoutes.get("/", (req, res) => {
  res.send("✅ Auth API is working!");
});

export default authRoutes;
