import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddReview from "../../components/Gigs/AddReview";
import Reviews from "../../components/Gigs/Reviews";
import { FaStar, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useStateProvider } from "../../context/StateContext";
import { useRouter } from "next/router";

function Details() {
  const [{ gigData, hasOrdered }] = useStateProvider();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRatings, setAverageRatings] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === gigData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? gigData.images.length - 1 : prev - 1
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

  // Loading state for images
  useEffect(() => {
    if (gigData?.images?.length) {
      setIsLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center text-[#404145] hover:text-[#27272a] mb-6 transition-colors"
      >
        <FaChevronLeft className="mr-2" />
        Back to results
      </button>

      {/* Gig Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-[#404145] mb-4">
            {gigData.title}
          </h1>
          
          {/* Seller Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-12 w-12">
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
                  <FiUser className="text-white text-xl" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {gigData.createdBy.fullName}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    star <= Math.floor(averageRatings) ? (
                      <FaStar key={star} className="text-yellow-400" />
                    ) : (
                      <FaRegStar key={star} className="text-yellow-400" />
                    )
                  ))}
                </div>
                <span className="text-[#74767e]">
                  ({gigData.reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Box */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Pricing</h3>
          <p className="text-2xl font-bold text-[#404145] mb-2">
            ${gigData.price}
          </p>
          <p className="text-gray-600 mb-4">{gigData.shortDesc}</p>
          <button className="w-full bg-[#1DBF73] hover:bg-[#19a463] text-white py-3 px-6 rounded-md font-medium transition-colors">
            Continue (${gigData.price})
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative mb-12">
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

      {/* Gig Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          {/* About This Gig */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#404145] mb-6">
              About This Gig
            </h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{gigData.description}</p>
            </div>
          </section>

          {/* Features */}
          {gigData.features?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#404145] mb-6">
                What's Included
              </h2>
              <ul className="space-y-3">
                {gigData.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#1DBF73] mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* About The Seller */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-[#404145] mb-6">
              About The Seller
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24">
                  {gigData.createdBy.profileImage ? (
                    <Image
                      src={gigData.createdBy.profileImage}
                      alt={gigData.createdBy.username}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-purple-500 h-full w-full flex items-center justify-center rounded-full">
                      <FiUser className="text-white text-2xl" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {gigData.createdBy.fullName}
                </h3>
                <p className="text-gray-600 mb-4">
                  {gigData.createdBy.description || "No description provided"}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">
                      {averageRatings} ({gigData.reviews.length} reviews)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {gigData.createdBy.gigs?.length || 0} gigs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Delivery Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Time</span>
                <span className="font-medium">{gigData.deliveryTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revisions</span>
                <span className="font-medium">{gigData.revisions}</span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Category</h3>
            <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
              {gigData.category}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#404145] mb-6">
          Reviews ({gigData.reviews.length})
        </h2>
        <Reviews />
      </section>

      {/* Add Review (if purchased) */}
      {hasOrdered && <AddReview />}
    </div>
  );
}

export default Details;