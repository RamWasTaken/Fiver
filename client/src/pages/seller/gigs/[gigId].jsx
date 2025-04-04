import ImageUpload from "../../../components/ImageUpload";
import { categories } from "../../../utils/categories";
import { EDIT_GIG_DATA, GET_GIG_DATA } from "../../../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

function EditGig() {
  const [cookies] = useCookies(['jwt']);
  const router = useRouter();
  const { gigId } = router.query;
  
  // Constants
  const inputClassName = "block p-4 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const labelClassName = "mb-2 text-lg font-medium text-gray-900";
  
  // State
  const [files, setFile] = useState([]);
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    title: "",
    category: "",
    description: "",
    time: 0,
    revisions: 0,
    feature: "",
    price: 0,
    shortDesc: "",
    id: "", // Added missing id
  });

  // Fetch gig data on mount
  useEffect(() => {
    const fetchGigData = async () => {
      if (!gigId) return;
      
      try {
        setIsLoading(true);
        const { data: { gig } } = await axios.get(`${GET_GIG_DATA}/${gigId}`, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });

        setData({
          title: gig.title,
          category: gig.category,
          description: gig.description,
          time: gig.deliveryTime,
          revisions: gig.revisions,
          feature: "",
          price: gig.price,
          shortDesc: gig.shortDesc,
          id: gig.id,
        });
        
        setFeatures(gig.features || []);

        // Load existing images (with error handling)
        const imageFiles = await Promise.all(
          (gig.images || []).map(async (image) => {
            try {
              const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/${image}`;
              const response = await fetch(url);
              if (!response.ok) throw new Error("Failed to fetch image");
              const blob = await response.blob();
              return new File([blob], image, { type: blob.type });
            } catch (error) {
              console.error("Error loading image:", image, error);
              toast.warn(`Could not load image: ${image}`);
              return null;
            }
          })
        );

        setFile(imageFiles.filter(Boolean));
      } catch (err) {
        console.error("Error fetching gig data:", err);
        toast.error("Failed to load gig data");
        router.push("/seller/gigs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigData();
  }, [gigId, cookies.jwt, router]);

  // Handlers
  const removeFeature = (index) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const addFeature = () => {
    if (data.feature.trim()) {
      setFeatures(prev => [...prev, data.feature.trim()]);
      setData(prev => ({ ...prev, feature: "" }));
    }
  };

  const editGig = async () => {
    const { category, description, price, revisions, time, title, shortDesc, id } = data;

    // Validation
    if (!title || !description || !category || features.length === 0 || 
        files.length === 0 || price <= 0 || !shortDesc || revisions <= 0 || time <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true); // Set loading state
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => formData.append("images", file));
      
      // Add JSON data
      formData.append("data", JSON.stringify({
        title,
        description,
        category,
        features,
        price: Number(price),
        revisions: Number(revisions),
        time: Number(time),
        shortDesc,
      }));

      const response = await axios.put(
        `${EDIT_GIG_DATA}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${cookies.jwt}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Gig updated successfully!");
        router.push("/seller/gigs");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating gig:", error);
      let errorMessage = "Failed to update gig";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-xl">Loading gig data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-4 md:px-32">
      <h1 className="text-4xl md:text-6xl text-gray-900 mb-5">Edit Gig</h1>
      <h3 className="text-xl md:text-3xl text-gray-900 mb-5">
        Update your gig details
      </h3>
      
      <form 
        className="flex flex-col gap-5 mt-10" 
        onSubmit={(e) => { e.preventDefault(); editGig(); }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          {/* Title */}
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
          
          {/* Category */}
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
              required
            >
              <option value="">Select a category</option>
              {categories.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClassName}>
            Gig Description
          </label>
          <textarea
            id="description"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
            placeholder="Describe your gig in detail"
            name="description"
            value={data.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          {/* Delivery Time */}
          <div>
            <label htmlFor="delivery" className={labelClassName}>
              Delivery Time (days)
            </label>
            <input
              type="number"
              className={inputClassName}
              id="delivery"
              name="time"
              min="1"
              value={data.time}
              onChange={handleChange}
              placeholder="Minimum Delivery Time"
              required
            />
          </div>
          
          {/* Revisions */}
          <div>
            <label htmlFor="revision" className={labelClassName}>
              Number of Revisions
            </label>
            <input
              type="number"
              id="revision"
              className={inputClassName}
              placeholder="Max Number of Revisions"
              name="revisions"
              min="1"
              value={data.revisions}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          {/* Features */}
          <div>
            <label htmlFor="features" className={labelClassName}>
              Features
            </label>
            <div className="flex gap-3 items-center mb-5">
              <input
                type="text"
                id="features"
                className={inputClassName}
                placeholder="Enter a Feature Name"
                name="feature"
                value={data.feature}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <button
                type="button"
                className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium text-lg px-6 py-3 rounded-md transition-colors"
                onClick={addFeature}
              >
                Add
              </button>
            </div>
            
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-center py-2 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <span className="mr-2">{feature}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFeature(index)}
                      aria-label={`Remove ${feature}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Images */}
          <div>
            <label htmlFor="image" className={labelClassName}>
              Gig Images
            </label>
            <div>
              <ImageUpload 
                files={files} 
                setFile={setFile} 
                maxFiles={5}
                maxSizeMB={5}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          {/* Short Description */}
          <div>
            <label htmlFor="shortDesc" className={labelClassName}>
              Short Description
            </label>
            <input
              type="text"
              className={inputClassName}
              id="shortDesc"
              placeholder="Brief summary of your gig"
              name="shortDesc"
              value={data.shortDesc}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>
          
          {/* Price */}
          <div>
            <label htmlFor="price" className={labelClassName}>
              Gig Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <input
                type="number"
                className={`${inputClassName} pl-8`}
                id="price"
                placeholder="0.00"
                name="price"
                min="0.01"
                step="0.01"
                value={data.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-4">
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-semibold rounded-md transition-colors"
            onClick={() => router.push("/seller/gigs")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[#1DBF73] hover:bg-[#18a966] text-white text-lg font-semibold rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditGig;