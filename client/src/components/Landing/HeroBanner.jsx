import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

function HomeBanner() {
  const router = useRouter();
  const [image, setImage] = useState(1);
  const [searchData, setSearchData] = useState("");

  useEffect(() => {
    const interval = setInterval(
      () => setImage(image >= 6 ? 1 : image + 1),
      10000
    );
    return () => clearInterval(interval);
  }, [image]);

  return (
    <div className="relative bg-cover h-[500px] md:h-[680px]">
      {/* Background Images */}
      <div className="absolute top-0 right-0 w-full h-full transition-opacity z-0">
        <Image
          alt="hero"
          src="/bg-hero1.webp"
          fill
          className={`${
            image === 1 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
        <Image
          alt="hero"
          src="/bg-hero2.webp"
          fill
          className={`${
            image === 2 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
        <Image
          alt="hero"
          src="/bg-hero3.webp"
          fill
          className={`${
            image === 3 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
        <Image
          alt="hero"
          src="/bg-hero4.webp"
          fill
          className={`${
            image === 4 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
        <Image
          alt="hero"
          src="/bg-hero5.webp"
          fill
          className={`${
            image === 5 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
        <Image
          alt="hero"
          src="/bg-hero6.webp"
          fill
          className={`${
            image === 6 ? "opacity-100" : "opacity-0"
          } transition-all duration-1000 object-cover`}
        />
      </div>

      {/* Content */}
      <div className="z-10 relative w-full px-4 md:px-0 md:w-[650px] flex justify-center flex-col h-full gap-5 md:ml-20">
        <h1 className="text-white text-3xl md:text-5xl leading-snug">
          Find the perfect&nbsp;
          <i>SkillSharing</i>
          <br />
          services for your Study.
        </h1>
        
        {/* Search Bar */}
        <div className="flex align-middle w-full">
          <div className="relative flex-grow">
            <IoSearchOutline className="absolute text-gray-500 text-2xl flex align-middle h-full left-2" />
            <input
              type="text"
              className="h-12 md:h-14 w-full pl-10 rounded-md rounded-r-none"
              placeholder={`Try "building mobile app"`}
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/search?q=${searchData}`);
                }
              }}
            />
          </div>
          <button
            className="bg-[#1DBF73] text-white px-6 md:px-12 text-lg font-semibold rounded-r-md whitespace-nowrap"
            onClick={() => router.push(`/search?q=${searchData}`)}
          >
            Search
          </button>
        </div>
        
        {/* Popular Tags */}
        <div className="text-white flex flex-col sm:flex-row gap-2 sm:gap-4">
          <span className="text-sm sm:text-base">Popular:</span>
          <ul className="flex flex-wrap gap-2 sm:gap-3 md:gap-5">
            <li
              className="text-xs sm:text-sm py-1 px-2 sm:px-3 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer whitespace-nowrap"
              onClick={() => router.push("/search?q=website design")}
            >
              Website Design
            </li>
            <li
              className="text-xs sm:text-sm py-1 px-2 sm:px-3 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer whitespace-nowrap"
              onClick={() => router.push("/search?q=wordpress")}
            >
              Wordpress
            </li>
            <li
              className="text-xs sm:text-sm py-1 px-2 sm:px-3 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer whitespace-nowrap"
              onClick={() => router.push("/search?q=logo design")}
            >
              Logo Design
            </li>
            <li
              className="text-xs sm:text-sm py-1 px-2 sm:px-3 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer whitespace-nowrap"
              onClick={() => router.push("/search?q=ai services")}
            >
              AI Services
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomeBanner;