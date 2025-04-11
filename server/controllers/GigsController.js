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
    // 1. Parse and validate incoming data
    if (!req.body.data) {
      return res.status(400).json({ error: "Missing gig data" });
    }

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

    // 2. Validate required fields
    if (!title || !description || !category || !features?.length ||
      !price || !revisions || !time || !shortDesc) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 3. Get the existing gig data
    const gigId = parseInt(req.params.gigId);
    const oldGig = await prisma.gigs.findUnique({
      where: { id: gigId },
    });

    if (!oldGig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    // 4. Initialize image handling
    let imageUrls = [...oldGig.images]; // Start with existing images
    let newImageUrls = [];

    // 5. Process new file uploads if any
    if (req.files && req.files.length > 0) {
      try {
        // Upload new files to Supabase
        newImageUrls = await Promise.all(
          req.files.map(async (file) => {
            const fileExt = file.originalname.split('.').pop() || 'jpg';
            const fileName = `gigs/${gigId}/${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 8)}.${fileExt}`;

            // Upload to Supabase
            const { error } = await supabase.storage
              .from('gig-images')
              .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
              });

            if (error) throw error;

            // Get public URL
            return supabase.storage
              .from('gig-images')
              .getPublicUrl(fileName).data.publicUrl;
          })
        );

        // Combine new URLs with existing ones
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        // Clean up any partially uploaded files
        if (newImageUrls.length > 0) {
          await supabase.storage
            .from('gig-images')
            .remove(newImageUrls.map(url => {
              const parts = url.split('/');
              return parts.slice(parts.indexOf('gigs')).join('/');
            }));
        }
        throw new Error("Failed to upload new images");
      }
    }

    // 6. Update the gig in database
    const updatedGig = await prisma.gigs.update({
      where: { id: gigId },
      data: {
        title,
        description,
        deliveryTime: parseInt(time),
        category,
        features: Array.isArray(features) ? features : JSON.parse(features),
        price: parseFloat(price),
        shortDesc,
        revisions: parseInt(revisions),
        images: imageUrls
      },
    });

    // 7. Clean up old images if they were replaced
    if (req.files?.length > 0 && oldGig.images?.length > 0) {
      try {
        await supabase.storage
          .from('gig-images')
          .remove(oldGig.images.map(url => {
            const parts = url.split('/');
            return parts.slice(parts.indexOf('gigs')).join('/');
          }));
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
        // Not critical - we can continue
      }
    }

    // 8. Return success response
    return res.status(200).json({
      message: "Gig updated successfully",
      gig: updatedGig
    });

  } catch (err) {
    console.error("Error in editGig:", err);

    // Handle specific error cases
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid JSON data" });
    }

    return res.status(500).json({
      error: "Failed to update gig",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
    return res.status(400).send("Both searchTerm and category are required.");
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
    console.log("🔍 Add Review Request Received");
    console.log("➡ userId:", req.userId);
    console.log("➡ gigId:", req.params.gigId);
    console.log("➡ reviewText:", req.body.reviewText);
    console.log("➡ rating:", req.body.rating);

    const gig = await prisma.gigs.findUnique({ where: { id: parseInt(req.params.gigId) } });
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.userId) } });

    if (!gig || !user) {
      return res.status(404).json({ error: "User or Gig not found" });
    }

    // removed purchase requirment to addReview.
    if (req.userId && req.params.gigId) {
      // if (await checkOrder(req.userId, req.params.gigId)) {
      if (req.body.reviewText && req.body.rating) {
        try {
          const newReview = await prisma.reviews.create({
            data: {
              rating: parseInt(req.body.rating),
              reviewText: req.body.reviewText,
              reviewer: { connect: { id: parseInt(req.userId) } },
              gig: { connect: { id: parseInt(req.params.gigId) } },
            },
            include: { reviewer: true },
          });
          return res.status(201).json({ newReview });
        } catch (prismaError) {
          console.error("🔥 Prisma Error:", JSON.stringify(prismaError, null, 2));
          return res.status(500).send("Database error while creating review.");
        }
      } else {
        return res.status(400).send("ReviewText and Rating are required.");
      }
      // }
      // return res.status(400).send("You need to purchase the gig to add a review.");
    }
    return res.status(400).send("userId and gigId are required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
