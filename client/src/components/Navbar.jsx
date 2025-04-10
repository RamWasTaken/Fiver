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
import { FiMenu } from "react-icons/fi";

function Navbar() {
  const [cookies] = useCookies();
  const router = useRouter();
  const [navFixed, setNavFixed] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [{ showLoginModal, showSignupModal, isSeller, userInfo }, dispatch] = useStateProvider();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    if (showSignupModal) {
      dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: true });
    setIsMobileMenuOpen(false);
  };

  const handleSignup = () => {
    if (showLoginModal) {
      dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: true });
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  const handleModeSwitch = () => {
    dispatch({ type: reducerCases.SWITCH_MODE });
    router.push(isSeller ? "/buyer/orders" : "/seller");
    setIsMobileMenuOpen(false);
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
          
          if (projectedUserInfo.image && !projectedUserInfo.image.startsWith('http')) {
            projectedUserInfo.image = `${HOST}${projectedUserInfo.image}`;
          }
          
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
          className={`w-full px-4 md:px-24 flex justify-between items-center py-4 top-0 z-30 transition-all duration-300 ${
            navFixed || userInfo ? "fixed bg-white border-b border-gray-200" : "absolute bg-transparent border-transparent"
          }`}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <FiverrLogo fillColor={!navFixed && !userInfo ? "#ffffff" : "#404145"} />
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className={`hidden md:flex ${navFixed || userInfo ? "opacity-100" : "opacity-0"}`}>
            <input
              type="text"
              placeholder="What service are you looking for today?"
              className="w-[30rem] py-2.5 px-4 border"
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/search?q=${searchData}`);
                }
              }}
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

          {/* Right side content */}
          <div className="flex items-center">
            {/* Mobile Menu Button - Only visible on mobile */}
            {windowWidth <= 768 && (
              <button 
                className="text-gray-700 ml-auto" // Added ml-auto to push to right
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <FiMenu size={24} />
              </button>
            )}

            {/* Desktop Navbar Buttons - Hidden on mobile */}
            {windowWidth > 768 && (
              <>
                {!userInfo ? (
                  <ul className="flex gap-10 items-center">
                    <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={handleLogin}>Sign In</li>
                    <li className="cursor-pointer font-medium" onClick={handleSignup}>Join</li>
                  </ul>
                ) : (
                  <ul className="flex gap-10 items-center">
                    <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={handleOrdersNavigate}>
                      Orders
                    </li>

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

                    <li className="cursor-pointer font-medium" onClick={handleModeSwitch}>
                      {isSeller ? "Switch to Buyer" : "Switch to Seller"}
                    </li>

                    <li className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsContextMenuVisible(true); }}>
                      {userInfo?.image ? (
                        <Image
                          src={userInfo.image.startsWith('http') ? userInfo.image : `${HOST}${userInfo.image}`}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          unoptimized
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-profile.png';
                          }}
                        />
                      ) : (
                        <div className="bg-purple-500 h-10 w-10 flex items-center justify-center rounded-full text-white text-xl">
                          {userInfo?.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu - Only visible when toggled */}
          {isMobileMenuOpen && windowWidth <= 768 && (
            <div className="fixed top-16 right-4 bg-white shadow-lg rounded-md z-50 p-4 w-48">
              {!userInfo ? (
                <>
                  <div className="cursor-pointer text-[#1DBF73] font-medium py-2" onClick={handleLogin}>Sign In</div>
                  <div className="cursor-pointer font-medium py-2" onClick={handleSignup}>Join</div>
                </>
              ) : (
                <>
                  <div className="cursor-pointer text-[#1DBF73] font-medium py-2" onClick={handleOrdersNavigate}>
                    Orders
                  </div>

                  {isSeller && (
                    <>
                      <div className="cursor-pointer text-[#1DBF73] font-medium py-2" onClick={() => { router.push("/seller/gigs/create"); setIsMobileMenuOpen(false); }}>
                        Create Gig
                      </div>
                      <div className="cursor-pointer text-[#1DBF73] font-medium py-2" onClick={() => { router.push("/seller/gigs"); setIsMobileMenuOpen(false); }}>
                        Manage Gigs
                      </div>
                    </>
                  )}

                  <div className="cursor-pointer font-medium py-2" onClick={handleModeSwitch}>
                    {isSeller ? "Switch to Buyer" : "Switch to Seller"}
                  </div>

                  <div className="cursor-pointer font-medium py-2" onClick={() => { router.push("/profile"); setIsMobileMenuOpen(false); }}>
                    Profile
                  </div>

                  <div className="cursor-pointer font-medium py-2" onClick={() => { router.push("/logout"); setIsMobileMenuOpen(false); }}>
                    Logout
                  </div>
                </>
              )}
            </div>
          )}

          {isContextMenuVisible && <ContextMenu data={ContextMenuData} />}
        </nav>
      )}
    </>
  );
}

export default Navbar;