"use client";
//keep trying.

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { SET_USER_IMAGE, SET_USER_INFO } from "../utils/constants";
import Image from "next/image";

const Profile = () => {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [cookies] = useCookies();
  // Ensure existing values are pre-filled
  const [data, setData] = useState({
    fullName: userInfo?.fullName || " ",
    userName: userInfo?.username || " ",
    description: userInfo?.description || " ",
  });
  const [image, setImage] = useState(userInfo?.image || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!cookies.jwt) router.push("/login");
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
      if (!selectedFile) return;

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(SET_USER_IMAGE, formData, {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Uploaded Image URL:", response.data.img);
      setImage(response.data.img);
      return response.data.img;
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMessage("Failed to upload image. Try again.");
      return null;
    }
  };

  const handleProfileUpdate = async () => {
    try {
      let uploadedImage = image;

      if (selectedFile) {
        uploadedImage = await uploadProfileImage();
        if (!uploadedImage) return;
        setImage(uploadedImage);
      }

      const payload = {
        fullName: data.fullName || userInfo.fullName,
        userName: data.userName || userInfo.username,
        description: data.description || userInfo.description,
        image: uploadedImage,
      };

      const response = await axios.post(SET_USER_INFO, payload, {
        headers: { Authorization: `Bearer ${cookies.jwt}` },
      });

      if (response.data.userNameError) {
        setErrorMessage("Username is already taken. Choose a different one.");
        return;
      }

      dispatch({ type: reducerCases.SET_USER, userInfo: response.data.user });
      router.push("/");
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMessage("Failed to update profile. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="relative w-32 h-32 mb-4">
          {image ? (
            <Image src={image.startsWith("http") ? image : "/default-avatar.png"} alt="Profile" fill className="rounded-full" unoptimized />
          ) : (
            <span className="text-6xl">
              {userInfo?.email?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        <input
          type="text"
          className="text-black bg-gray-200 input-field"
          name="fullName"
          value={data.fullName}
          onChange={handleInputChange}
          placeholder="Full Name"
        />
        <input
          type="text"
          className="text-black bg-gray-200 input-field"
          name="userName"
          value={data.userName}
          onChange={handleInputChange}
          placeholder="Username"
        />
        <textarea
          name="description"
          className="text-black bg-gray-200 input-field"
          value={data.description}
          onChange={handleInputChange}
          placeholder="About Me"
        />

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        <button
          onClick={handleProfileUpdate}
          className="mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
