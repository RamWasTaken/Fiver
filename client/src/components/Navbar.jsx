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
  const [cookies] = useCookies(); // Access JWT token from cookies
  const router = useRouter();
  const [navFixed, setNavFixed] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // State from Context API
  const [{ showLoginModal, showSignupModal, isSeller, userInfo }, dispatch] = useStateProvider();

  // Handle login modal toggle
  const handleLogin = () => {
    if (showSignupModal) {
      dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: true });
  };

  // Handle signup modal toggle
  const handleSignup = () => {
    if (showLoginModal) {
      dispatch({ type: reducerCases.TOGGLE_LOGIN_MODAL, showLoginModal: false });
    }
    dispatch({ type: reducerCases.TOGGLE_SIGNUP_MODAL, showSignupModal: true });
  };

  // Navbar links
  const links = [
    { linkName: "Fiverr Business", handler: "#", type: "link" },
    { linkName: "Explore", handler: "#", type: "link" },
    { linkName: "English", handler: "#", type: "link" },
    { linkName: "Meet", handler: "/meet", type: "link" },
    { linkName: "Become a Seller", handler: "#", type: "link" },
    { linkName: "Sign in", handler: handleLogin, type: "button" },
    { linkName: "Join", handler: handleSignup, type: "button2" },
  ];

  // Handle scrolling behavior for fixed navbar
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

  // Handle navigation to orders
  const handleOrdersNavigate = () => {
    router.push(isSeller ? "/seller/orders" : "/buyer/orders");
  };

  // Switch between buyer & seller mode
  const handleModeSwitch = () => {
    dispatch({ type: reducerCases.SWITCH_MODE });
    router.push(isSeller ? "/buyer/orders" : "/seller");
  };

  // Fetch user info if JWT exists and user is not already set
  useEffect(() => {
    if (cookies.jwt && !userInfo) {
      const getUserInfo = async () => {
        try {
          if (!cookies.jwt) {
            console.error("❌ JWT token is missing!");
            return;
          }

          // Extract the actual token string from the cookie
          // If cookies.jwt is an object with a token property, use that
          // Otherwise try to use it directly as a string
          const tokenValue = typeof cookies.jwt === 'object' 
            ? cookies.jwt.token || JSON.stringify(cookies.jwt) 
            : cookies.jwt;
            
          console.log("📡 Fetching user info with JWT token");

          const response = await axios.post(
            GET_USER_INFO,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${tokenValue}`, // Use the extracted token value
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

          // Dispatch user info to global state
          dispatch({ type: reducerCases.SET_USER, userInfo: projectedUserInfo });

          setIsLoaded(true);
          console.log("✅ User data set:", projectedUserInfo);

          // Redirect to profile setup if required
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

  // Context menu state
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  
  // Handle closing context menu on outside click
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

  // Context menu options
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

          {/* Navbar Links */}
          {!userInfo ? (
            <ul className="flex gap-10 items-center">
              {links.map(({ linkName, handler, type }) => (
                <li key={linkName} className={`${navFixed ? "text-black" : "text-white"} font-medium`}>
                  {type === "link" ? <Link href={handler}>{linkName}</Link> : <button onClick={handler}>{linkName}</button>}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex gap-10 items-center">
              <li className="cursor-pointer text-[#1DBF73] font-medium" onClick={handleOrdersNavigate}>Orders</li>
              <li className="cursor-pointer font-medium" onClick={handleModeSwitch}>
                {isSeller ? "Switch To Buyer" : "Switch To Seller"}
              </li>
              <li className="cursor-pointer" onClick={() => setIsContextMenuVisible(true)}>
                {userInfo.imageName ? (
                  <Image src={userInfo.imageName} alt="Profile" width={40} height={40} className="rounded-full" />
                ) : <div className="bg-purple-500 h-10 w-10 flex items-center justify-center rounded-full text-white text-xl">
                  {userInfo?.email?.[0]?.toUpperCase()}
                </div>}
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