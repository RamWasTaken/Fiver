import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddReview from "../../components/Gigs/AddReview";
import Reviews from "../../components/Gigs/Reviews";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useStateProvider } from "../../context/StateContext";
import { useRouter } from "next/router";

function Details() {
  const [{ gigData, hasOrdered }] = useStateProvider();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRatings, setAverageRatings] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === gigData?.images?.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? gigData?.images?.length - 1 : prev - 1
    );
  };

  // Calculate average ratings
  useEffect(() => {
    if (gigData?.reviews?.length) {
      const avgRating = gigData.reviews.reduce(
        (sum, { rating }) => sum + rating, 0
      ) / gigData.reviews.length;
      setAverageRatings(avgRating.toFixed(1));
    }
  }, [gigData]);

  if (!gigData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading gig details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Gig Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#404145] mb-2">
          {gigData.title}
        </h1>
        
        {/* Seller Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative h-10 w-10">
            {gigData.createdBy.profileImage ? (
              <Image
                src={gigData.createdBy.profileImage}
                alt={gigData.createdBy.username}
                fill
                className="rounded-full object-cover"
                onLoadingComplete={() => setIsLoading(false)}
              />
            ) : (
              <div className="bg-purple-500 h-full w-full flex items-center justify-center rounded-full">
                <FiUser className="text-white text-lg" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{gigData.createdBy.fullName}</span>
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span>{averageRatings}</span>
              <span className="text-[#74767e]">({gigData.reviews.length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        {isLoading ? (
          <div className="aspect-video bg-gray-100 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={gigData.images[currentImageIndex]}
                alt={`${gigData.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
              
              {/* Navigation Arrows */}
              {gigData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {gigData.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto py-2">
                {gigData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 relative h-20 w-32 rounded-md overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-[#1DBF73]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Gig Description */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-[#404145] mb-4">
          About This Gig
        </h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{gigData.description}</p>
        </div>
      </div>

      {/* Features */}
      {gigData.features?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-[#404145] mb-4">
            What's Included
          </h2>
          <ul className="space-y-2">
            {gigData.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#1DBF73] mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* About The Seller */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-[#404145] mb-4">
          About The Seller
        </h2>
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="relative h-20 w-20">
              {gigData.createdBy.profileImage ? (
                <Image
                  src={gigData.createdBy.profileImage}
                  alt={gigData.createdBy.username}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="bg-purple-500 h-full w-full flex items-center justify-center rounded-full">
                  <FiUser className="text-white text-xl" />
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-1">
              {gigData.createdBy.fullName}
            </h3>
            <p className="text-gray-600 mb-3">
              {gigData.createdBy.description || "No description provided"}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span>
                  {averageRatings} ({gigData.reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#404145] mb-6">
          Reviews ({gigData.reviews.length})
        </h2>
        <Reviews />
      </div>

      {/* Add Review (if purchased) */}
      {hasOrdered && <AddReview />}
    </div>
  );
}

export default Details;