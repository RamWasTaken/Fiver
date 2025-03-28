import Link from "next/link";
import React from "react";
import FiverrLogo from "./FiverrLogo";

function Footer() {
  const data = [
    {
      headerName: "Explore",
      links: [
        { name: "Categories", link: "#" },
        { name: "About", link: "#" },
        { name: "Support", link: "#" },
        { name: "Community", link: "#" },
      ],
    },
    {
      headerName: "Legal",
      links: [
        { name: "Privacy Policy", link: "#" },
        { name: "Terms of Service", link: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full px-10 py-8 border-t border-gray-300 bg-gray-100 text-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <FiverrLogo fillColor={"#404145"} />
        <ul className="flex gap-10 mt-5 md:mt-0">
          {data.map(({ headerName, links }) => (
            <li key={headerName} className="flex flex-col items-center md:items-start">
              <span className="font-semibold text-lg">{headerName}</span>
              <ul className="mt-2 space-y-1 text-sm">
                {links.map(({ name, link }) => (
                  <li key={name} className="hover:text-[#1DBF73] transition">
                    <Link href={link}>{name}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-center text-sm mt-5 text-gray-500">
        © {new Date().getFullYear()} YourApp. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
