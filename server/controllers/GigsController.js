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
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      const fileNames = [];

      if (!existsSync("uploads")) mkdirSync("uploads");

      fileKeys.forEach((file) => {
        const date = Date.now();
        renameSync(
          req.files[file].path,
          "uploads/" + date + req.files[file].originalname
        );
        fileNames.push(date + req.files[file].originalname);
      });

      if (req.query) {
        const {
          title,
          description,
          category,
          features,
          price,
          revisions,
          time,
          shortDesc,
        } = req.query;

        const oldData = await prisma.gigs.findUnique({
          where: { id: parseInt(req.params.gigId) },
        });

        if (!oldData) return res.status(404).send("Gig not found");

        await prisma.gigs.update({
          where: { id: parseInt(req.params.gigId) },
          data: {
            title,
            description,
            deliveryTime: parseInt(time),
            category,
            features: JSON.parse(features),
            price: parseInt(price),
            shortDesc,
            revisions: parseInt(revisions),
            createdBy: { connect: { id: parseInt(req.userId) } },
            images: fileNames,
          },
        });

        oldData?.images.forEach((image) => {
          if (existsSync(`uploads/${image}`)) unlinkSync(`uploads/${image}`);
        });

        return res.status(201).send("Successfully edited the gig.");
      }
    }
    return res.status(400).send("All properties are required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
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
