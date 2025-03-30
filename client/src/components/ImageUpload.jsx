import Image from "next/image";
import React, { useState } from "react";

function ImageUpload({ files, setFile, maxFiles = 5, maxSizeMB = 5 }) {
  const [message, setMessage] = useState("");
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFile = (e) => {
    setMessage("");
    const newFiles = Array.from(e.target.files);

    // Check if adding these files would exceed max limit
    if (files.length + newFiles.length > maxFiles) {
      setMessage(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    const validFiles = [];
    let hasError = false;

    newFiles.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        setMessage("Only JPG, PNG, WEBP, or GIF images are allowed");
        hasError = true;
        return;
      }

      if (file.size > maxSizeBytes) {
        setMessage(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        hasError = true;
        return;
      }

      validFiles.push(file);
    });

    if (!hasError && validFiles.length > 0) {
      setFile([...files, ...validFiles]);
    }
  };

  const removeImage = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFile(newFiles);
  };

  return (
    <div className="px-3">
      <div className="rounded-lg bg-gray-50 w-full">
        <div className="m-4">
          {message && (
            <span 
              className="flex justify-center items-center text-xs mb-1 text-red-500"
              role="alert"
              aria-live="assertive"
            >
              {message}
            </span>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label 
              className="flex cursor-pointer flex-col w-full h-32 border-2 rounded-md border-dashed hover:bg-gray-100 hover:border-gray-300"
              tabIndex="0"
              aria-label="Upload images"
            >
              <div className="flex flex-col items-center justify-center pt-7">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-400 group-hover:text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  Select photos (max {maxFiles})
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP, GIF up to {maxSizeMB}MB each
                </p>
              </div>
              <input
                type="file"
                onChange={handleFile}
                className="opacity-0 absolute"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                aria-hidden="true"
              />
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                {files.length} of {maxFiles} files selected
              </p>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`} 
                    className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-200"
                  >
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                    <Image 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;