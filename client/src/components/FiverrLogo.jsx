import React from "react";
import Image from "next/image";

function FiverrLogo() {
  return (
    <div className="flex justify-center items-center">
      {/* Small Image */}
      <Image 
        src="/skillShare.jpg" 
        width={50}  // Adjust width
        height={50} // Adjust height
        alt="Skill Share"
        className="rounded-lg shadow-md" // Optional styling
      />
    </div>
  );
}

export default FiverrLogo;
