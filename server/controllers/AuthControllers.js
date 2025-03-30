import { Prisma, PrismaClient } from "@prisma/client";
import { genSalt, hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient.js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const generatePassword = async (password) => {
  const salt = await genSalt();
  return await hash(password, salt);
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password Required");
    }

    const hashedPassword = await generatePassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email },
      jwt: createToken(email, user.id),
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).send("Email Already Registered");
    }
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password Required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Invalid Password");
    }

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      jwt: createToken(email, user.id),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User info:", user);
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        image: user.profileImage,
        username: user.username,
        fullName: user.fullName,
        description: user.description,
        isProfileSet: user.isProfileInfoSet,
      },
    });
  } catch (err) {
    console.error("Error fetching user info:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// NEW: Added route from index.js to get user info by ID
export const getUserInfoById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return only the image URL for public access
    return res.json({ 
      imageUrl: user.profileImage 
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Failed to retrieve user info" });
  }
};

export const setUserInfo = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userName, fullName, description } = req.body;
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {};
    if (userName && userName !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({ where: { username: userName } });
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ error: "Username is already taken." });
      }
      updateData.username = userName;
    }
    if (fullName) updateData.fullName = fullName;
    if (description) updateData.description = description;

    if (Object.keys(updateData).length > 0) {
      updateData.isProfileInfoSet = true;
    } else {
      return res.status(400).json({ error: "No changes provided." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error setting user info:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ error: "Username is already taken." });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const setUserImage = async (req, res, next) => {
  console.log("Received File at AuthController:", req.file);
  try {
    console.log("Received file:", req.file);
    console.log("Received user ID:", req.userId);

    if (!req.file) {
      return res.status(400).send("Image not included.");
    }
    if (!req.userId) {
      return res.status(401).send("Unauthorized");
    }

    const { buffer, mimetype, originalname } = req.file;
    // NEW: Using file extension from original filename for better consistency
    const fileExt = originalname.split('.').pop() || mimetype.split("/")[1];
    // NEW: Using predictable filename pattern with userId to make images retrievable
    const fileName = `profile-pictures/${req.userId}.${fileExt}`;

    // ✅ Upload image to Supabase Storage
    const { data, error } = await supabase.storage.from("profile-pictures").upload(fileName, buffer, {
      contentType: mimetype,
      upsert: true, // NEW: Added upsert flag to overwrite existing images
    });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return res.status(500).send("Failed to upload image.");
    }

    // ✅ Get the public URL of the uploaded image
    const { publicUrl } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

    // ✅ Save the public URL in the database
    await prisma.user.update({
      where: { id: req.userId },
      data: { profileImage: publicUrl },
    });

    return res.status(200).json({ img: publicUrl });
  } catch (err) {
    console.error("Error setting user image:", err);
    return res.status(500).send("Internal Server Error");
  }
};

// NEW: Added public user image upload route that was in index.js
export const setPublicUserImage = async (req, res, next) => {
  console.log("Received File at public endpoint:", req.file);
  try {
    const userId = req.body.userId;
    if (!req.file || !userId) {
      return res.status(400).json({ error: "Missing file or userId" });
    }

    const { buffer, mimetype, originalname } = req.file;
    const fileExt = originalname.split('.').pop() || mimetype.split("/")[1];
    const fileName = `profile-pictures/${userId}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, buffer, { 
        contentType: mimetype, 
        upsert: true 
      });

    if (error) throw error;

    const { publicUrl } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);
    
    // NEW: Update the user's profile image in the database if they exist
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: publicUrl },
      });
    } catch (updateError) {
      console.warn("User may not exist in database:", updateError);
      // Continue anyway since this is public upload endpoint
    }
    
    return res.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};