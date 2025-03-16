import React, { useEffect, useState } from "react";
import FiverrLogo from "./FiverrLogo";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCookies } from "react-cookie";
import axios from "axios";
import { GET_USER_INFO, HOST } from "../utils/constants";
import ContextMenu from "./ContextMenu";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";

function Navbar() {
  const [cookies] = useCookies();
  const router = useRouter();
  const [navFixed, setNavFixed] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const [{ showLoginModal, showSignupModal, isSeller, userInfo }, dispatch] = useStateProvider();

  const handleLogin = () => {
    if (showSignupModal) {
      dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: true });
  };

  const handleSignup = () => {
    if (showLoginModal) {
      dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: true });
  };

  useEffect(() => {
    if (router.pathname === "/") {
      const positionNavbar = () => {
        window.pageYOffset > 0 ? setNavFixed(true) : setNavFixed(false);
      };
      window.addEventListener("scroll", positionNavbar);
      return () => window.removeEventListener("scroll", positionNavbar);
    } else {
      setNavFixed(true);
    }
  }, [router.pathname]);

  const handleOrdersNavigate = () => {
    router.push(isSeller ? "/seller/orders" : "/buyer/orders");
  };

  const handleModeSwitch = () => {
    dispatch({ type: reducerCases.SWITCH_MODE });
    router.push(isSeller ? "/buyer/orders" : "/seller");
  };

  useEffect(() => {
    if (cookies.jwt && !userInfo) {
      const getUserInfo = async () => {
        try {
          if (!cookies.jwt) {
            console.error("❌ JWT token is missing!");
            return;
          }

          const response = await axios.post(
            GET_USER_INFO,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${cookies.jwt}`
              },
            }
          );

          if (!response.data || !response.data.user) {
            console.warn("⚠️ No user data returned!");
            return;
          }

          let projectedUserInfo = { ...response.data.user };
          if (response.data.user.image) {
            projectedUserInfo = {
              ...projectedUserInfo,
              imageName: HOST + "/" + response.data.user.image,
            };
          }
          delete projectedUserInfo.image;

          dispatch({ type: reducerCases.SET_USER, userInfo: projectedUserInfo });

          setIsLoaded(true);

          if (response.data.user.isProfileSet === false) {
            router.push("/profile");
          }
        } catch (err) {
          console.error("❌ Error fetching user info:", err.response?.data?.error || err.message);
        }
      };

      getUserInfo();
    } else {
      setIsLoaded(true);
    }
  }, [cookies.jwt, userInfo, dispatch]);

  useEffect(() => {
    const clickListener = (e) => {
      e.stopPropagation();
      if (isContextMenuVisible) setIsContextMenuVisible(false);
    };

    if (isContextMenuVisible) {
      window.addEventListener("click", clickListener);
    }

    return () => {
      window.removeEventListener("click", clickListener);
    };
  }, [isContextMenuVisible]);

  const ContextMenuData = [
    {
      name: "Profile",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/profile");
      },
    },
    {
      name: "Logout",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <>
      {isLoaded && (
        <nav
          className={`w-full px-24 flex justify-between items-center py-6 top-0 z-30 transition-all duration-300 ${
            navFixed || userInfo ? "fixed bg-white border-b border-gray-200" : "absolute bg-transparent border-transparent"
          }`}
        >
          {/* Logo */}
          <div>
            <Link href="/">
              <FiverrLogo fillColor={!navFixed && !userInfo ? "#ffffff" : "#404145"} />
            </Link>
          </div>

          {/* Search Bar */}
          <div className={`flex ${navFixed || userInfo ? "opacity-100" : "opacity-0"}`}>
            <input
              type="text"
              placeholder="What service are you looking for today?"
              className="w-[30rem] py-2.5 px-4 border"
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
            />
            <button
              className="bg-gray-900 py-1.5 text-white w-16 flex justify-center items-center"
              onClick={() => {
                setSearchData("");
                router.push(`/search?q=${searchData}`);
              }}
            >
              <IoSearchOutline className="fill-white text-white h-6 w-6" />
            </button>
          </div>

          {/* Navbar Buttons */}
          {!userInfo ? (
            <ul className="flex gap-10 items-center">
              <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={handleLogin}>Sign In</li>
              <li className="cursor-pointer font-medium" onClick={handleSignup}>Join</li>
            </ul>
          ) : (
            <ul className="flex gap-10 items-center">
              {/* Orders Button */}
              <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={handleOrdersNavigate}>
                Orders
              </li>

              {/* Seller-Specific Buttons */}
              {isSeller && (
                <>
                  <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={() => router.push("/seller/gigs/create")}>
                    Create Gig
                  </li>
                  <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={() => router.push("/seller/gigs")}>
                    Manage Gigs
                  </li>
                </>
              )}

              {/* Switch Role Button */}
              <li className="cursor-pointer font-medium" onClick={handleModeSwitch}>
                {isSeller ? "Switch to Buyer" : "Switch to Seller"}
              </li>

              {/* Profile Menu */}
              <li className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsContextMenuVisible(true); }}>
                {userInfo.imageName ? (
                  <Image src={userInfo.imageName} alt="Profile" width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="bg-purple-500 h-10 w-10 flex items-center justify-center rounded-full text-white text-xl">
                    {userInfo?.email?.[0]?.toUpperCase()}
                  </div>
                )}
              </li>
            </ul>
          )}
          {isContextMenuVisible && <ContextMenu data={ContextMenuData} />}
        </nav>
      )}
    </>
  );
}

export default Navbar;
