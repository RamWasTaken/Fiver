import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (file) => {
    try {
        if (!file) throw new Error("No file provided");

        // 🔹 Generate a unique filename
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        console.log("Uploading file to Supabase:", filePath);

        // 🔹 Upload image to Supabase Storage
        const { data, error } = await supabase.storage.from("profile-images").upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

        if (error) throw error;

        // 🔹 Get public URL
        const { data: publicUrlData } = supabase.storage.from("profile-images").getPublicUrl(filePath);
        const publicUrl = publicUrlData.publicUrl;

        console.log("Image uploaded successfully:", publicUrl);
        return publicUrl;
    } catch (err) {
        console.error("Error uploading image:", err.message);
        return null;
    }
};
