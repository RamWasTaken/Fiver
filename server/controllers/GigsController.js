import { existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { prisma } from "../prismaClient.js";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// In your backend route handler (addGig)
export const addGig = async (req, res) => {
  try {
    // Parse the JSON data from form-data
    const gigData = JSON.parse(req.body.data);
    
    const { 
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc
    } = gigData;

    // Validate required fields
    if (!title || !description || !category || !features?.length || 
        !price || !revisions || !time || !shortDesc) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Handle file uploads to Supabase
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `gigs/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('gig-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false // Don't overwrite existing files
          });

        if (error) throw new Error(`Supabase upload error: ${error.message}`);
        
        return supabase.storage
          .from('gig-images')
          .getPublicUrl(fileName).data.publicUrl;
      });

      imageUrls = await Promise.all(uploadPromises);
    } else {
      return res.status(400).json({ error: "At least one image is required" });
    }

    // 2. Create gig in database
    const gig = await prisma.gigs.create({
      data: {
        title,
        description,
        deliveryTime: parseInt(time),
        category,
        features: features,
        price: parseInt(price),
        shortDesc,
        revisions: parseInt(revisions),
        userId: req.userId,
        images: imageUrls
      }
    });

    return res.status(201).json(gig);

  } catch (err) {
    console.error("Error creating gig:", err);
    
    // Clean up any uploaded files if error occurred
    if (imageUrls?.length) {
      await Promise.all(imageUrls.map(url => {
        const fileName = url.split('/').pop();
        return supabase.storage
          .from('gig-images')
          .remove([`gigs/${fileName}`]);
      }));
    }

    return res.status(500).json({ 
      error: "Failed to create gig",
      message: err.message 
    });
  }
};

export const getUserAuthGigs = async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { gigs: true },
      });
      return res.status(200).json({ gigs: user?.gigs ?? [] });
    }
    return res.status(400).send("UserId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getGigData = async (req, res, next) => {
  try {
    if (req.params.gigId) {
      const gig = await prisma.gigs.findUnique({
        where: { id: parseInt(req.params.gigId) },
        include: {
          reviews: { include: { reviewer: true } },
          createdBy: true,
        },
      });

      if (!gig) return res.status(404).send("Gig not found");

      const userWithGigs = await prisma.user.findUnique({
        where: { id: gig.createdBy.id },
        include: {
          gigs: { include: { reviews: true } },
        },
      });

      if (!userWithGigs) return res.status(404).send("User not found");

      const totalReviews = userWithGigs.gigs.reduce(
        (acc, gig) => acc + gig.reviews.length,
        0
      );

      const averageRating =
        totalReviews > 0
          ? (
              userWithGigs.gigs.reduce(
                (acc, gig) =>
                  acc +
                  gig.reviews.reduce((sum, review) => sum + review.rating, 0),
                0
              ) / totalReviews
            ).toFixed(1)
          : "0.0";

      return res.status(200).json({ gig: { ...gig, totalReviews, averageRating } });
    }
    return res.status(400).send("GigId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const editGig = async (req, res, next) => {
  try {
    // Parse the JSON data from form-data (CHANGED: same as addGig)
    const gigData = JSON.parse(req.body.data);
    
    const { 
      title,
      description,
      category,
      features,
      price,
      revisions,
      time,
      shortDesc
    } = gigData;

    // Validate required fields (NEW: validation like addGig)
    if (!title || !description || !category || !features?.length || 
        !price || !revisions || !time || !shortDesc) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get old gig data (NEW: needed for image cleanup)
    const oldGig = await prisma.gigs.findUnique({
      where: { id: parseInt(req.params.gigId) },
    });

    if (!oldGig) return res.status(404).send("Gig not found");

    let imageUrls = oldGig.images; // Keep existing images by default

    // 1. Handle file uploads to Supabase (CHANGED: like addGig)
    if (req.files && req.files.length > 0) {
      // Upload new files to Supabase
      const uploadPromises = req.files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `gigs/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('gig-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) throw new Error(`Supabase upload error: ${error.message}`);
        
        return supabase.storage
          .from('gig-images')
          .getPublicUrl(fileName).data.publicUrl;
      });

      imageUrls = await Promise.all(uploadPromises);

      // Delete old images from Supabase (NEW: cleanup)
      if (oldGig.images?.length) {
        await Promise.all(oldGig.images.map(url => {
          const fileName = url.split('/').pop();
          return supabase.storage
            .from('gig-images')
            .remove([`gigs/${fileName}`]);
        }));
      }
    }

    // 2. Update gig in database (CHANGED: using proper data format)
    const updatedGig = await prisma.gigs.update({
      where: { id: parseInt(req.params.gigId) },
      data: {
        title,
        description,
        deliveryTime: parseInt(time),
        category,
        features: features, // CHANGED: no need for JSON.parse
        price: parseInt(price),
        shortDesc,
        revisions: parseInt(revisions),
        images: imageUrls
      },
    });

    return res.status(200).json(updatedGig);

  } catch (err) {
    console.error("Error updating gig:", err);
    
    // Clean up any uploaded files if error occurred (NEW: like addGig)
    if (imageUrls?.length && req.files?.length) {
      await Promise.all(imageUrls.map(url => {
        const fileName = url.split('/').pop();
        return supabase.storage
          .from('gig-images')
          .remove([`gigs/${fileName}`]);
      }));
    }

    return res.status(500).json({ 
      error: "Failed to update gig",
      message: err.message 
    });
  }
};

export const searchGigs = async (req, res, next) => {
  try {
    if (req.query.searchTerm || req.query.category) {
      const gigs = await prisma.gigs.findMany(
        createSearchQuery(req.query.searchTerm, req.query.category)
      );
      return res.status(200).json({ gigs });
    }
    return res.status(400).send("Search Term or Category is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const createSearchQuery = (searchTerm, category) => ({
  where: {
    OR: [
      searchTerm ? { title: { contains: searchTerm, mode: "insensitive" } } : {},
      category ? { category: { contains: category, mode: "insensitive" } } : {},
    ],
  },
  include: {
    reviews: { include: { reviewer: true } },
    createdBy: true,
  },
});

const checkOrder = async (userId, gigId) => {
  try {
    return await prisma.orders.findFirst({
      where: {
        buyerId: parseInt(userId),
        gigId: parseInt(gigId),
        isCompleted: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export const checkGigOrder = async (req, res, next) => {
  try {
    if (req.userId && req.params.gigId) {
      const hasUserOrderedGig = await checkOrder(req.userId, req.params.gigId);
      return res.status(200).json({ hasUserOrderedGig: !!hasUserOrderedGig });
    }
    return res.status(400).send("userId and gigId are required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const addReview = async (req, res, next) => {
  try {
    if (req.userId && req.params.gigId) {
      if (await checkOrder(req.userId, req.params.gigId)) {
        if (req.body.reviewText && req.body.rating) {
          const newReview = await prisma.review.create({
            data: {
              rating: req.body.rating,
              reviewText: req.body.reviewText,
              reviewer: { connect: { id: parseInt(req.userId) } },
              gig: { connect: { id: parseInt(req.params.gigId) } },
            },
            include: { reviewer: true },
          });
          return res.status(201).json({ newReview });
        }
        return res.status(400).send("ReviewText and Rating are required.");
      }
      return res.status(400).send("You need to purchase the gig to add a review.");
    }
    return res.status(400).send("userId and gigId are required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
