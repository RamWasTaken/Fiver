import Image from "next/image";
import React from "react";

function JoinFiverr() {
  return (
    <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-32 my-8 md:my-12 lg:my-16 relative">
      <div className="absolute z-10 top-1/2 sm:top-1/3 left-4 sm:left-6 md:left-8 lg:left-10 transform -translate-y-1/2 sm:translate-y-0">
        <h4 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          Suddenly it&apos;s all so <i className="font-semibold">Doable.</i>
        </h4>
        <button
          className="border text-sm sm:text-base font-medium px-4 sm:px-5 py-1 sm:py-2 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md hover:bg-[#19a865] transition-colors duration-200"
          type="button"
        >
          Skill Share
        </button>
      </div>
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96">
        <Image 
          src="/bg-signup.webp" 
          fill 
          alt="signup" 
          className="rounded-sm object-cover"
        />
      </div>
    </div>
  );
}

export default JoinFiverr;