"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { createUserProfile, uploadProfileMedia } from "@/lib/profile";

export default function CompanyProfilePage() {
  const router = useRouter();
  const user = useAuth();

  const [categories, setCategories] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialFiles, setSocialFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedSocialMedia, setUploadedSocialMedia] = useState<any[]>([]);

  const handleSocialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSocialFiles(Array.from(e.target.files));
  };

  const handleSocialMediaSave = async () => {
    if (socialFiles.length === 0) {
      setShowSocialModal(false);
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const response = await uploadProfileMedia(socialFiles);

      console.log("Uploaded media response:", response);

      setUploadedSocialMedia((prev) => [...prev, ...response]);

      // Later: save response URLs to profile if needed
      setSocialFiles([]);
      setShowSocialModal(false);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const [formData, setFormData] = useState({
    companyName: "",
    about: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    pin: "",
    website: "",
    facebook: "",
    userType: "seller" as "seller" | "buyer",
  });

  const categorySuggestions = [
    "DMC",
    "Hotel",
    "Tour Operator",
    "Travel Agency",
    "Airlines",
    "Car Rental",
    "Cruise",
    "Technology",
    "Insurance",
  ];

  const filteredSuggestions = categorySuggestions.filter(
    (category) =>
      category.toLowerCase().includes(inputValue.toLowerCase()) &&
      !categories.includes(category)
  );

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
  };

  const removeLastCategory = () => {
    if (inputValue === "" && categories.length > 0) {
      setCategories(categories.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addCategory(inputValue.trim());
    } else if (e.key === "Backspace" && inputValue === "") {
      removeLastCategory();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user) return;

  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     await createUserProfile({
  //       company_name: formData.companyName,
  //       user_type: formData.userType,
  //       category: categories.join(", "),
  //       country: formData.country,
  //       city: formData.city,
  //       website: formData.website,
  //       whatsapp: formData.phone, // mapping phone to whatsapp as per previous schema
  //       userId: user.id,
  //     });

  //     router.push("/profile");
  //   } catch (err: any) {
  //     setError(err.message || "Something went wrong while creating profile");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  setIsLoading(true);
  setError("");

  try {
    const imageSections =
      uploadedSocialMedia.length > 0
        ? [
            {
              Title: "Social Media",
              description: "Uploaded social media images",
              order: 1,
              imageUrls: uploadedSocialMedia.map(
                (file) =>
                  `${file.url}`
              ),
            },
          ]
        : [];

    await createUserProfile({
      company_name: formData.companyName,
      user_type: formData.userType,
      country: formData.country,
      city: formData.city,

      about: formData.about
        ? [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: formData.about,
                },
              ],
            },
          ]
        : undefined,

      website: formData.website,
      whatsapp: formData.phone,

      slug: formData.companyName
        .toLowerCase()
        .replace(/\s+/g, "-"),

      verified_badge: false,
      founding_member: false,
      profile_status: "active",

      userId: user.id,

      category: {
        type: categories[0] || "General",
      },

      image_sections: imageSections,
    });

    router.push("/profile");
  } catch (err: any) {
    setError(err.message || "Something went wrong while creating profile");
  } finally {
    setIsLoading(false);
  }
};

  
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="LetsB2B Logo"
            width={36}
            height={36}
          />
          <div className="flex flex-col">
            <span className="text-lg font-medium text-black">
              Let's <span className="font-bold">B2B</span>
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#94a3b8] -mt-1">
              GLOBAL
            </span>
          </div>
        </div>

        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
          ?
        </div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center py-10 bg-white">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-xl text-black font-semibold">
              Hello {user?.username || "User"}, Welcome to Let’s{" "}
              <span className="font-bold">B2B</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              List your Company Lorem ipsum is simply dummy text of the printing
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center relative mb-8">
            <div className="flex items-center justify-between w-full relative z-10 max-w-[200px]">
              {/* Connecting Line */}
              <div className="absolute left-8 right-8 h-0.5 bg-gray-700 top-4 z-0" />

              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-500" />
                <span className="text-xs mt-2 text-gray-800 font-medium">
                  Company info.
                </span>
              </div>

              <div className="flex flex-col items-center relative z-10">
                <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-white" />
                <span className="text-xs mt-2 text-gray-400">
                  KYC Verification
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm transition-all"
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}

            <input
              className="input text-black"
              placeholder="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleFormChange}
              required
            />

            {/* Category Tag Input */}
            <div className="relative">
              <div
                className="min-h-[48px] p-2 border border-gray-300 rounded-md flex flex-wrap gap-2 items-center cursor-text transition-colors focus-within:border-blue-500"
                onClick={() =>
                  document.getElementById("category-input")?.focus()
                }
              >
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm transition-all"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(category);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 font-bold text-base leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="category-input"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setShowSuggestions(inputValue.length > 0)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder={categories.length === 0 ? "Category" : ""}
                  className="flex-1 text-black outline-none min-w-[120px] px-2 py-1 text-sm bg-transparent"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => addCategory(suggestion)}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              className="input h-20 resize-none py-2 text-black"
              placeholder="About (optional)"
              name="about"
              value={formData.about}
              onChange={handleFormChange}
            />

            <input
              className="input text-black"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
            <input
              className="input text-black"
              placeholder="Address Line"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="input text-black"
                placeholder="Country"
                name="country"
                value={formData.country}
                onChange={handleFormChange}
                required
              />
              <input
                className="input text-black"
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                required
              />
            </div>
            <input
              className="input text-black"
              placeholder="PIN"
              name="pin"
              value={formData.pin}
              onChange={handleFormChange}
            />

            <div className="border rounded-md px-4 py-3 flex items-center justify-between text-sm bg-gray-50">
              <span className="text-gray-500">
                Logo{" "}
                <span className="text-red-500 text-xs ml-2">
                  500x500px max file size 1mb
                </span>
              </span>
              <button
                type="button"
                className="px-3 py-1 text-black border border-gray-300 bg-white rounded text-sm hover:bg-gray-100 transition-colors font-medium"
              >
                Choose file
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                User Type
              </label>
              <select
                className="input text-black"
                name="userType"
                value={formData.userType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    userType: e.target.value as "seller" | "buyer",
                  }))
                }
                required
              >
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>

            <input
              className="input text-black"
              placeholder="Website link (optional)"
              name="website"
              value={formData.website}
              onChange={handleFormChange}
            />
            <input
              className="input text-black"
              placeholder="Facebook (optional)"
              name="facebook"
              value={formData.facebook}
              onChange={handleFormChange}
            />

            <div className="flex justify-end">
              <div
                onClick={() => setShowSocialModal(true)}
                className="text-sm flex items-center gap-2 text-gray-600 cursor-pointer hover:text-black transition-colors font-medium"
              >
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                  +
                </div>
                Add Social Media Profile
              </div>
            </div>

            {uploadedSocialMedia.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Uploaded Social Media Images
                </p>

                <div className="flex flex-wrap gap-3">
                  {uploadedSocialMedia.map((file, index) => (
                    <div
                      key={index}
                      className="w-20 text-center text-xs text-gray-600"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <p className="truncate mt-1">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-blue-600 text-white font-bold rounded-md transition-all hover:bg-blue-700 active:scale-[0.98] ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "SUBMITTING..." : "CONTINUE"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full h-12 text-black border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              SKIP NOW
            </button>
          </form>
        </div>

        {showSocialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
              {/* Close button */}
              <button
                onClick={() => setShowSocialModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              >
                ×
              </button>

              <h2 className="text-lg font-semibold text-black mb-4">
                Add Social Media Files
              </h2>

              {/* File upload */}
              <label className="block border border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleSocialFileChange}
                />
                <p className="text-sm text-gray-600">Click to choose files</p>
                <p className="text-xs text-gray-400 mt-1">
                  You can upload multiple images/files
                </p>
              </label>

              {/* File preview */}
              {socialFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                  {socialFiles.map((file, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 flex justify-between items-center border-b pb-1"
                    >
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSocialMediaSave}
                  disabled={uploading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 ${
                    uploading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? "Uploading..." : "Save"}
                </button>
                {uploadError && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tailwind reusable input style */}
      <style jsx global>{`
        .input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }
        .input:focus {
          outline: none;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
