import { Prisma, PrismaClient } from "@prisma/client";
import { genSalt, hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { renameSync } from "fs";

const prisma = new PrismaClient(); // ✅ Reused PrismaClient instead of creating a new instance in each function

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
    console.error("Signup error:", err); // ✅ Better error logging
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
    console.error("Login error:", err); // ✅ Added proper error logging
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

export const setUserInfo = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userName, fullName, description } = req.body;
    if (!userName || !fullName || !description) {
      return res.status(400).send("Username, Full Name, and Description should be included.");
    }

    const existingUser = await prisma.user.findUnique({ where: { username: userName } });
    if (existingUser) {
      return res.status(400).json({ userNameError: true });
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: { username: userName, fullName, description, isProfileInfoSet: true },
    });
    return res.status(200).send("Profile data updated successfully.");
  } catch (err) {
    console.error("Error setting user info:", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ userNameError: true });
    }
    return res.status(500).send("Internal Server Error");
  }
};

export const setUserImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("Image not included.");
    }
    if (!req.userId) {
      return res.status(401).send("Unauthorized");
    }

    const date = Date.now();
    let fileName = `uploads/profiles/${date}${req.file.originalname}`;
    renameSync(req.file.path, fileName);

    await prisma.user.update({
      where: { id: req.userId },
      data: { profileImage: fileName },
    });
    return res.status(200).json({ img: fileName });
  } catch (err) {
    console.error("Error setting user image:", err);
    return res.status(500).send("Internal Server Error");
  }
};
