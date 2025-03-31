import React from "react";
import { FiClock, FiRefreshCcw } from "react-icons/fi";
import { BiRightArrowAlt } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useStateProvider } from "../../context/StateContext";
import { useRouter } from "next/router";

function Pricing() {
  const [{ gigData, userInfo }] = useStateProvider();
  const router = useRouter();

  if (!gigData) return null;

  // Calculate average rating
  const averageRating = gigData.reviews?.length 
    ? (gigData.reviews.reduce((sum, { rating }) => sum + rating, 0) / gigData.reviews.length)
    : 0;

  return (
    <div className="sticky top-24 h-fit">
      <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{gigData.title}</h3>
          <span className="text-2xl font-bold">${gigData.price}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              star <= Math.floor(averageRating) ? (
                <FaStar key={star} size={16} />
              ) : (
                <FaRegStar key={star} size={16} />
              )
            ))}
          </div>
          <span>({gigData.reviews?.length || 0} reviews)</span>
        </div>

        {/* Delivery Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <FiClock className="text-lg" />
            <span>{gigData.deliveryTime} Days Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FiRefreshCcw className="text-lg" />
            <span>{gigData.revisions} Revisions</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {gigData.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <BsCheckLg className="text-[#1DBF73] mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        {gigData.userId === userInfo?.id ? (
          <button
            className="w-full bg-[#1DBF73] hover:bg-[#19a463] text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            onClick={() => router.push(`/seller/gigs/${gigData.id}`)}
          >
            Edit Gig
            <BiRightArrowAlt className="text-xl" />
          </button>
        ) : (
          <button
            className="w-full bg-[#1DBF73] hover:bg-[#19a463] text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            onClick={() => router.push(`/checkout?gigId=${gigData.id}`)}
          >
            Continue (${gigData.price})
            <BiRightArrowAlt className="text-xl" />
          </button>
        )}
      </div>

      {/* Contact Button */}
      {gigData.userId !== userInfo?.id && (
        <button
          className="w-full mt-4 border border-gray-300 hover:bg-gray-100 py-3 px-6 rounded-md font-medium transition-colors"
          onClick={() => router.push(`/messages?recipientId=${gigData.userId}`)}
        >
          Contact Seller
        </button>
      )}
    </div>
  );
}

export default Pricing;