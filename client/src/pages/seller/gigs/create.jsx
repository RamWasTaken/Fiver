"use client"; 
import ImageUpload from "../../../components/ImageUpload";
import { categories } from "../../../utils/categories";
import { ADD_GIG_ROUTE } from "../../../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useEffect } from "react";

function CreateGigs() {
  const [cookies] = useCookies(['jwt']);
  const router = useRouter();
  const inputClassName =
    "block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500";
  const labelClassName = "mb-2 text-lg font-medium text-gray-900  ";
  const [files, setFile] = useState([]);
  const [features, setfeatures] = useState([]);
  const [data, setData] = useState({
    title: "",
    category: categories[0]?.name || "",
    description: "",
    time: 0,
    revisions: 0,
    feature: "",
    price: 0,
    shortDesc: "",
  });
  useEffect(() => {
    console.log("🚀 Category being sent:", data.category);
  }, [data.category]);
  // Only runs when `category` changes

  // Function to remove a feature from the list
  const removeFeature = (index) => {
    const clonedFeatures = [...features];
    clonedFeatures.splice(index, 1);
    setfeatures(clonedFeatures);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Add a feature to the list
  const addFeature = () => {
    if (data.feature) {
      setfeatures([...features, data.feature]);
      setData({ ...data, feature: "" });
    }
  };

  // Function to add a new gig
const addGig = async () => {
  const { category, description, price, revisions, time, title, shortDesc } = data;

  // Validate all required fields
  if (!category || !description || !title || features.length === 0 ||
    files.length === 0 || price <= 0 || !shortDesc || revisions <= 0 || time <= 0) {
  alert("Please fill all required fields");
  return;
}

  const formData = new FormData();
  
  // Append files
  files.forEach((file) => formData.append("images", file));
  
  // Append other data as JSON
  const gigData = {
    title,
    description,
    category,
    features, // Send as array directly
    price,
    revisions,
    time,
    shortDesc,
  };
  
  formData.append("data", JSON.stringify(gigData));

  try {
    const response = await axios.post(ADD_GIG_ROUTE, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${String(cookies.jwt)}`,
      },
    });

    if (response.status === 201) {
      router.push("/seller/gigs");
    }
  } catch (error) {
    console.error("Error creating gig:", error);
    alert(error.response?.data?.message || "Failed to create gig");
  }
};

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-32 ">
      <h1 className="text-6xl text-gray-900 mb-5">Create a new Gig</h1>
      <h3 className="text-3xl text-gray-900 mb-5">
        Enter the details to create the gig
      </h3>
      <form action="" className="flex flex-col gap-5 mt-10">
        <div className="grid grid-cols-2 gap-11">
          <div>
            <label htmlFor="title" className={labelClassName}>
              Gig Title
            </label>
            <input
              name="title"
              value={data.title}
              onChange={handleChange}
              type="text"
              id="title"
              className={inputClassName}
              placeholder="e.g. I will do something I'm really good at"
              required
            />
          </div>
          <div>
            <label htmlFor="categories" className={labelClassName}>
              Select a Category
            </label>
            <select
              id="categories"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4"
              name="category"
              onChange={handleChange}
              value={data.category}
            >
              <option value="" disabled>Choose a Category</option> {/* Disabled option */}
              {categories.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

          </div>
        </div>
        <div>
          <label htmlFor="description" className={labelClassName}>
            Gig Description
          </label>
          <textarea
            id="description"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write a short description"
            name="description"
            value={data.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="grid grid-cols-2 gap-11">
          <div>
            <label htmlFor="delivery">Delivery Time</label>
            <input
              type="number"
              className={inputClassName}
              id="delivery"
              name="time"
              value={data.time}
              onChange={handleChange}
              placeholder="Minimum Delivery Time"
            />
          </div>
          <div>
            <label htmlFor="revision" className={labelClassName}>
              Revisions
            </label>
            <input
              type="number"
              id="revision"
              className={inputClassName}
              placeholder="Max Number of Revisions"
              name="revisions"
              value={data.revisions}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-11">
          <div>
            <label htmlFor="features" className={labelClassName}>
              Features
            </label>
            <div className="flex gap-3 items-center mb-5">
              <ul>
                {features.map((feature, index) => (
                  <li key={index} className="flex justify-between items-center border p-2 my-2">
                    {feature}
                    <button
                      type="button"
                      className="text-red-500 font-bold ml-3"
                      onClick={() => removeFeature(index)}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>

              <input
                type="text"
                id="features"
                className={inputClassName}
                placeholder="Enter a Feature Name"
                name="feature"
                value={data.feature}
                onChange={handleChange}
              />
              <button
                type="button"
                className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800  font-medium  text-lg px-10 py-3 rounded-md "
                onClick={addFeature}
              >
                Add
              </button>

            </div>
          </div>
          <div>
            <label htmlFor="image" className={labelClassName}>
              Gig Images
            </label>
            <div>
              <ImageUpload files={files} setFile={setFile} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-11">
          <div>
            <label htmlFor="shortDesc" className={labelClassName}>
              Short Description
            </label>
            <input
              type="text"
              className={`${inputClassName} w-1/5`}
              id="shortDesc"
              placeholder="Enter a short description."
              name="shortDesc"
              value={data.shortDesc}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="price" className={labelClassName}>
              Support ( ♡ )
            </label>
            <input
              type="number"
              className={`${inputClassName} w-1/5`}
              id="price"
              placeholder="Enter a price"
              name="price"
              value={data.price}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <button
            className="border text-lg font-semibold px-5 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md"
            type="button"
            onClick={addGig}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateGigs;
