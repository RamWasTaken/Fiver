import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import {
  HOST,
  IMAGES_URL,
  SET_USER_IMAGE,
  SET_USER_INFO,
} from "../utils/constants";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function Profile() {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [image, setImage] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    userName: "",
    fullName: "",
    description: "",
  });

  // ✅ Ensure Axios sends cookies with requests
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const handleData = { ...data };

    if (userInfo) {
      if (userInfo?.username) handleData.userName = userInfo?.username;
      if (userInfo?.description) handleData.description = userInfo?.description;
      if (userInfo?.fullName) handleData.fullName = userInfo?.fullName;

      console.log("🔍 User Info:", userInfo);

      // ✅ If user has a profile image, fetch & convert it to File object
      if (userInfo?.imageName) {
        fetch(userInfo.imageName)
          .then(async (response) => {
            const contentType = response.headers.get("content-type");
            const blob = await response.blob();

            // ✅ Ensure the file is properly named
            const fileName = userInfo.imageName.split("/").pop();
            const file = new File([blob], fileName, { type: contentType });

            setImage(file);
          })
          .catch((error) => console.error("❌ Error fetching image:", error));
      }

      setData(handleData);
      setIsLoaded(true);
    }
  }, [userInfo]);

  // ✅ Handle Image Selection with Error Handling
  const handleFile = (e) => {
    const file = e.target.files?.[0]; // Ensure file exists
    if (!file) return; // Prevent errors when no file is selected

    const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
    if (validImageTypes.includes(file.type)) {
      setImage(file);
    } else {
      setErrorMessage("Invalid image format. Please upload JPG, PNG, or GIF.");
    }
  };

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // ✅ Handle Profile Update
  const setProfile = async () => {
    try {
      console.log("🔍 Sending profile data:", data);

      // ✅ Send profile info update request
      const response = await axios.post(SET_USER_INFO, data, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('jwt=')[1].split(';')[0]}`
        }
      });

      console.log("✅ Profile update response:", response.data);

      if (response.data.userNameError) {
        setErrorMessage("Enter a Unique Username");
        return;
      }

      let imageName = "";

      // ✅ If an image is selected, upload it
      if (image) {
        const formData = new FormData();
        formData.append("images", image);

        const imgResponse = await axios.post(SET_USER_IMAGE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${document.cookie.split('jwt=')[1].split(';')[0]}`
          },
        });

        imageName = imgResponse.data.img;
      }

      // ✅ Update global state with new user info
      dispatch({
        type: reducerCases.SET_USER,
        userInfo: {
          ...userInfo,
          ...data,
          image: imageName ? `${HOST}/${imageName}` : false,
        },
      });

      router.push("/");
    } catch (err) {
      console.error("❌ Profile update failed:", err);
    }
  };

  // ✅ Styling for Inputs
  const inputClassName =
    "block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500";
  const labelClassName =
    "mb-2 text-lg font-medium text-gray-900  dark:text-white";

  return (
    <>
      {isLoaded && (
        <div className="flex flex-col items-center justify-start min-h-[80vh] gap-3">
          {errorMessage && (
            <div>
              <span className="text-red-600 font-bold">{errorMessage}</span>
            </div>
          )}
          <h2 className="text-3xl">Welcome to Fiverr Clone</h2>
          <h4 className="text-xl">
            Please complete your profile to get started
          </h4>
          <div className="flex flex-col items-center w-full gap-5">
            {/* Profile Image Selection */}
            <div
              className="flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              <label className={labelClassName}>Select a Profile Picture</label>
              <div className="bg-purple-500 h-36 w-36 flex items-center justify-center rounded-full relative">
                {image ? (
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="profile"
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-6xl text-white">
                    {userInfo.email[0].toUpperCase()}
                  </span>
                )}
                <div
                  className={`absolute bg-slate-400 h-full w-full rounded-full flex items-center justify-center transition-all duration-100 ${imageHover ? "opacity-100" : "opacity-0"
                    }`}
                >
                  <span className="flex items-center justify-center relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 text-white absolute"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="file"
                      onChange={handleFile}
                      className="opacity-0"
                      name="profileImage"
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Username and Full Name */}
            <div className="flex gap-4 w-[500px]">
              <div>
                <label className={labelClassName}>Username</label>
                <input
                  className={inputClassName}
                  type="text"
                  name="userName"
                  placeholder="Username"
                  value={data.userName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClassName}>Full Name</label>
                <input
                  className={inputClassName}
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={data.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="border text-lg font-semibold px-5 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md"
              onClick={setProfile}
            >
              Set Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
