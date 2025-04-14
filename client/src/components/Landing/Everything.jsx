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
    <div className="bg-[#f1fdf7] flex py-20 justify-between px-24">
      <div>
        <h2 className="text-4xl mb-5 text-[#404145] font-bold">
          The best part? Everything.
        </h2>
        <ul className="flex flex-col gap-10">
          {everythingData.map(({ title, subtitle }) => {
            return (
              <li key={title}>
                <div className="flex gap-2 items-center text-xl">
                  <BsCheckCircle className="text-[#62646a]" />
                  <h4>{title}</h4>
                </div>
                <p className="text-[#62646a]">{subtitle}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative h-96 w-2/4">
        <Image src="/everything.webp" fill alt="everything" />
      </div>
    </div>
  );
}

export default Everything;
