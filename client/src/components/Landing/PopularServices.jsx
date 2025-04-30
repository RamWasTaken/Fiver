import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function PopularServices() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const popularServicesData = [
    { name: "Ai Artists", label: "Add talent to AI", image: "/service1.png" },
    { name: "Logo Design", label: "Build your brand", image: "/service2.jpeg" },
    { name: "Wordpress", label: "Customize your site", image: "/service3.jpeg" },
    { name: "Voice Over", label: "Share your message", image: "/service4.jpeg" },
    { name: "SEO", label: "Unlock growth online", image: "/service6.jpeg" },
    { name: "Translation", label: "Go global", image: "/service8.jpeg" },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === popularServicesData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? popularServicesData.length - 1 : prevIndex - 1
    );
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }

    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  // Calculate visible items based on screen size
  const getVisibleItems = () => {
    if (typeof window === 'undefined') return 1; // SSR fallback
    
    const width = window.innerWidth;
    if (width < 640) return 1;    // Mobile
    if (width < 768) return 2;    // Small tablet
    if (width < 1024) return 3;   // Tablet
    return 4;                     // Desktop
  };

  const visibleItems = getVisibleItems();
  const endIndex = Math.min(currentIndex + visibleItems, popularServicesData.length);
  const adjustedEndIndex = endIndex === popularServicesData.length ? 
    popularServicesData.length : 
    currentIndex + visibleItems;

  return (
    <div className="mx-4 sm:mx-8 md:mx-20 my-8 md:my-16 relative">
      <h2 className="text-2xl sm:text-3xl md:text-4xl mb-5 text-[#404145] font-bold">
        Popular Services
      </h2>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100/visibleItems)}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {popularServicesData.map(({ name, label, image }) => (
            <div 
              key={name}
              className="flex-shrink-0 px-2"
              style={{ width: `${100/visibleItems}%` }}
            >
              <div
                className="relative cursor-pointer group"
                onClick={() => router.push(`/search?q=${name.toLowerCase()}`)}
              >
                <div className="absolute z-10 text-white left-3 sm:left-4 md:left-5 top-3 sm:top-4">
                  <span className="text-xs sm:text-sm md:text-base">{label}</span>
                  <h6 className="font-extrabold text-lg sm:text-xl md:text-2xl">{name}</h6>
                </div>
                <div className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 w-full aspect-[4/3] relative overflow-hidden rounded-lg">
                  <Image 
                    src={image} 
                    fill 
                    alt="service" 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors hidden sm:block"
        aria-label="Previous services"
      >
        <FiChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors hidden sm:block"
        aria-label="Next services"
      >
        <FiChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(popularServicesData.length / visibleItems) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * visibleItems)}
            className={`w-3 h-3 rounded-full ${currentIndex >= index * visibleItems && currentIndex < (index + 1) * visibleItems ? 'bg-[#404145]' : 'bg-gray-300'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default PopularServices;