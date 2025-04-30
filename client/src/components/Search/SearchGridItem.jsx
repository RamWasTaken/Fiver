import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { FaStar } from "react-icons/fa";

// time wasted 1hr and multiple Deepseek conversation msgs
// Working code DO NOT CHANGE.

function SearchGridItem({ gig }) {
  const router = useRouter();
  
  const calculateRatings = () => {
    const { reviews } = gig;
    let rating = 0;
    if (!reviews?.length) {
      return 0;
    }
    reviews?.forEach((review) => {
      rating += review.rating;
    });
    return (rating / reviews.length).toFixed(1);
  };

  // Get the first image URL from Supabase
  const getMainImageUrl = () => {
    if (!gig.images?.length) return '/default-gig-image.jpeg'; // fallback image
    return gig.images[0]; // Assuming images are stored as full URLs in Supabase
  };

  // Get profile image URL from Supabase
  const getProfileImageUrl = () => {
    if (!gig.createdBy.profileImage) return null;
    return gig.createdBy.profileImage; // Assuming this is the full Supabase URL
  };

  return (
    <div
      className="max-w-[300px] flex flex-col gap-2 p-1 cursor-pointer mb-8"
      onClick={() => router.push(`/gig/${gig.id}`)}
    >
      {/* Main Gig Image */}
      <div className="relative w-64 h-40">
        <Image
          src={getMainImageUrl()}
          alt={gig.title || "Gig image"}
          fill
          className="rounded-xl object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
      
      {/* User Profile Section */}
      <div className="flex items-center gap-2">
        <div>
          {getProfileImageUrl() ? (
            <Image
              src={getProfileImageUrl()}
              alt={`${gig.createdBy.username}'s profile`}
              height={30}
              width={30}
              className="rounded-full object-cover"
              quality={80}
            />
          ) : (
            <div className="bg-purple-500 h-7 w-7 flex items-center justify-center rounded-full relative">
              <span className="text-lg text-white">
                {gig.createdBy.email[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="text-md ">
          <strong className="font-medium">{gig.createdBy.username}</strong>
        </span>
      </div>
      
      {/* Gig Title */}
      <div>
        <p className="line-clamp-2 text-[#404145]">{gig.title}</p>
      </div>
      
      {/* Ratings */}
      <div className="flex items-center gap-1 text-yellow-400">
        <FaStar />
        <span>
          <strong className="font-medium">{calculateRatings()}</strong>
        </span>
        <span className="text-[#74767e]">({gig.reviews.length})</span>
      </div>
      
      {/* Price */}
      <div>
        <strong className="font-medium">{gig.price} ♡ </strong>
      </div>
    </div>
  );
}

export default SearchGridItem;