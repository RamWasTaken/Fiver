'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { SET_USER_IMAGE, SET_USER_INFO } from '../utils/constants';
import Image from 'next/image';

const Profile = () => {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [cookies] = useCookies();

  const [data, setData] = useState({
    firstName: userInfo?.firstName || '',
    lastName: userInfo?.lastName || '',
    about: userInfo?.about || '',
    userName: userInfo?.userName || '',
  });

  const [image, setImage] = useState(userInfo?.image || '');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (!cookies.jwt) router.push('/login');
  }, [cookies, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid image format. Please upload JPG, PNG, or GIF.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.post(SET_USER_INFO, { ...data, image }, {
        headers: { Authorization: `Bearer ${cookies.jwt}` },
      });

      if (response.data.userNameError) {
        setErrorMessage('Enter a unique username');
        return;
      }

      dispatch({ type: reducerCases.SET_USER, userInfo: response.data.user });
      router.push('/');
    } catch (err) {
      console.error('Profile update failed:', err);
      setErrorMessage('Failed to update profile. Try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="relative w-32 h-32 mb-4">
          {image ? (
            <Image src={image} alt="Profile" fill className="rounded-full" />
          ) : (
            <span className="text-6xl">{userInfo?.email?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

        <input type="text" name="firstName" value={data.firstName} onChange={handleInputChange} placeholder="First Name" className="input-field" />
        <input type="text" name="lastName" value={data.lastName} onChange={handleInputChange} placeholder="Last Name" className="input-field" />
        <input type="text" name="userName" value={data.userName} onChange={handleInputChange} placeholder="Username" className="input-field" />
        <textarea name="about" value={data.about} onChange={handleInputChange} placeholder="About Me" className="input-field" />
        
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        
        <button onClick={handleProfileUpdate} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">Update Profile</button>
      </div>
    </div>
  );
};

export default Profile;
