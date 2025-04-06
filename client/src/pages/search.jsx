import SearchGridItem from "../components/Search/SearchGridItem";
import { SEARCH_GIGS_ROUTE } from "../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import React, { useEffect, useState } from "react";

function Search() {
  const router = useRouter();
  const { category, q } = router.query;
  const [gigs, setGigs] = useState(undefined);
  const [cookies] = useCookies(['jwt']);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categories = ["Web Development", "Design", "Marketing", "Writing"];

  const handleCategorySelect = (selectedCategory) => {
    router.push({
      pathname: "/search",
      query: { ...router.query, category: selectedCategory },
    });
    setShowCategoryDropdown(false); // close dropdown
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const {
          data: { gigs },
        } = await axios.get(
          `${SEARCH_GIGS_ROUTE}?searchTerm=${q}&category=${category}`,
          {
            headers: {
              Authorization: `Bearer ${cookies.jwt}`, // Add the Authorization header
            },
          }
        );
        setGigs(gigs);
      } catch (err) {
        console.error(err);
      }
    };
    if (category || q) getData();
  }, [category, q, cookies.jwt]);

  return (
    <>
      {gigs && (
        <div className="mx-24 mb-24">
          {q && (
            <h3 className="text-4xl mb-10">
              Results for <strong>{q}</strong>
            </h3>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="py-3 px-5 border border-gray-400 rounded-lg font-medium"
            >
              Category
            </button>
            {showCategoryDropdown && (
              <div className="absolute bg-white shadow-md rounded mt-2 z-10 w-40">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
            <button className="py-3 px-5 border border-gray-400 rounded-lg font-medium">
              Budget
            </button>
            <button className="py-3 px-5 border border-gray-400 rounded-lg font-medium">
              Delivery Time
            </button>
          </div>

          <div className="my-4">
            <span className="text-[#74767e] font-medium">
              {gigs.length} services available
            </span>
          </div>

          {gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10">
              <img
                src="/empty.png"
                alt="No gigs found"
                className="w-80 h-80 object-contain mb-4"
              />
              <p className="text-gray-500 text-xl">😕 No gigs found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {gigs.map((gig) => (
                <SearchGridItem gig={gig} key={gig.id} />
              ))}
            </div>
          )}

        </div>
      )}

    </>
  );
}

export default Search;
