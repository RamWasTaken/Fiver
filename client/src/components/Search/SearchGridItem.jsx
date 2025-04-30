import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

function SearchGridItem({ gig }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = gig.images?.length ? gig.images : ['/default-gig-image.jpeg'];

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const calculateRatings = () => {
    const { reviews } = gig;
    let rating = 0;
    if (!reviews?.length) return 0;
    reviews.forEach((review) => (rating += review.rating));
    return (rating / reviews.length).toFixed(1);
  };

  const getProfileImageUrl = () => {
    if (!gig.createdBy.profileImage) return null;
    return gig.createdBy.profileImage;
  };

  return (
    <div
      className="max-w-[300px] w-full flex flex-col gap-2 p-1 cursor-pointer mb-8"
      onClick={() => router.push(`/gig/${gig.id}`)}
    >
      {/* Carousel */}
      <div className="relative w-full h-40 overflow-hidden rounded-xl">
        <Image
          src={images[currentIndex]}
          alt={`Gig Image ${currentIndex + 1}`}
          fill
          className="object-cover rounded-xl transition-all duration-300"
          sizes="100vw"
        />

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded-full text-xs"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded-full text-xs"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-2 mt-1">
        {getProfileImageUrl() ? (
          <Image
            src={getProfileImageUrl()}
            alt={`${gig.createdBy.username}'s profile`}
            height={30}
            width={30}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="bg-purple-500 h-7 w-7 flex items-center justify-center rounded-full relative">
            <span className="text-lg text-white">
              {gig.createdBy.email[0].toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-md">
          <strong className="font-medium">{gig.createdBy.username}</strong>
        </span>
      </div>

      {/* Gig Title */}
      <p className="line-clamp-2 text-[#404145]">{gig.title}</p>

      {/* Ratings */}
      <div className="flex items-center gap-1 text-yellow-400">
        <FaStar />
        <span>
          <strong className="font-medium">{calculateRatings()}</strong>
        </span>
        <span className="text-[#74767e]">({gig.reviews.length})</span>
      </div>

      {/* Price */}
      <strong className="font-medium">{gig.price} ♡</strong>
    </div>
  );
}

export default SearchGridItem;
