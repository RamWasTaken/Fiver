import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";

function Everything() {
  const everythingData = [
    {
      title: "Access Services for Free",
      subtitle:
        "No costs, no subscriptions—anyone can use the platform without paying. Learn and share skills freely.",
    },
    {
      title: "Skill Exchange System",
      subtitle:
        "Learn new skills by exchanging your own expertise. Offer what you know and get what you want in return.",
    },
    {
      title: "Instant Communication",
      subtitle:
        "Chat directly with skill providers to discuss details, ask questions, and arrange exchanges.",
    },
    {
      title: "Custom Video Calling",
      subtitle:
        "Hop on a custom-built video calling app designed for seamless learning and collaboration.",
    },
  ];  

  return (
    <div className="bg-[#f1fdf7] flex flex-col lg:flex-row py-10 md:py-16 lg:py-20 px-6 sm:px-10 md:px-16 lg:px-24">
      <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl mb-5 text-[#404145] font-bold">
          The best part? Everything.
        </h2>
        <ul className="flex flex-col gap-6 md:gap-8 lg:gap-10">
          {everythingData.map(({ title, subtitle }) => {
            return (
              <li key={title} className="flex flex-col gap-2">
                <div className="flex gap-2 items-center text-lg sm:text-xl">
                  <BsCheckCircle className="text-[#62646a] min-w-[20px]" />
                  <h4 className="font-medium">{title}</h4>
                </div>
                <p className="text-[#62646a] text-sm sm:text-base pl-7 sm:pl-8">
                  {subtitle}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="w-full lg:w-1/2 relative h-64 sm:h-80 md:h-96 lg:h-[400px]">
        <Image 
          src="/everything.webp" 
          fill 
          alt="everything" 
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default Everything;