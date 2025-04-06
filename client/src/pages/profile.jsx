"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { SET_USER_IMAGE, SET_USER_INFO } from "../utils/constants";
import Image from "next/image";

// Disable static generation for this authenticated page
export const dynamic = 'force-dynamic';

const Profile = () => {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(false); // Make sure this is defined

  const [data, setData] = useState({
    fullName: userInfo?.fullName || "",
    userName: userInfo?.username || "",
    description: userInfo?.description || "",
  });
  const [image, setImage] = useState(userInfo?.image || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!cookies.jwt) router.push("/");
  }, [cookies, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Invalid image format. Please upload JPG, PNG, or GIF.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async () => {
    try {
      if (!selectedFile) return null;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(SET_USER_IMAGE, formData, {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.imageUrl) {
        throw new Error("No image URL received");
      }

      return response.data.imageUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      let errorMsg = "Failed to upload image. Try again.";
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrorMessage(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      let uploadedImage = image;
      if (selectedFile) {
        uploadedImage = await uploadProfileImage();
        if (!uploadedImage) return;
      }

      const payload = {
        fullName: data.fullName.trim() || userInfo.fullName,
        userName: data.userName.trim() || userInfo.username,
        description: data.description.trim() || userInfo.description,
      };

      const response = await axios.post(SET_USER_INFO, payload, {
        headers: { Authorization: `Bearer ${cookies.jwt}` },
      });

      if (response.data.error) {
        setErrorMessage(response.data.error);
        return;
      }

      dispatch({
        type: reducerCases.SET_USER,
        userInfo: {
          ...userInfo,
          ...response.data.user,
          image: uploadedImage || userInfo.image
        }
      });
      router.push("/");
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to update profile. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-gray-600">
            {image ? (
              <Image
                src={image}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
                onError={() => setImage("/default-image.jpeg")}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-4xl text-gray-400">
                  {userInfo?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="fullName"
              value={data.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="userName"
              value={data.userName}
              onChange={handleInputChange}
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">About Me</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={data.description}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
            />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
          )}

          <button
            onClick={handleProfileUpdate}
            disabled={isLoading}
            className={`w-full mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;