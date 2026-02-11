"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { createUserProfile, uploadProfileMedia } from "@/lib/profile";

export default function CompanyProfilePage() {
  const router = useRouter();
  const user = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const categoryRef = useRef<HTMLDivElement>(null);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);

  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [headerImageUploading, setHeaderImageUploading] = useState(false);

  const [socialTitle, setSocialTitle] = useState("");
  const [socialDescription, setSocialDescription] = useState("");
  const [socialOrder, setSocialOrder] = useState<number | "">("");

  const [subcategory, setSubcategory] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  const [categoriesData, setCategoriesData] = useState<
    { type: string; subtype?: string; description?: string }[]
  >([]);

  const [popupCategory, setPopupCategory] = useState({
    type: "",
    subtype: "",
    description: "",
  });

  const savePrimaryCategory = () => {
    if (!categories[0]) return;

    const primary = {
      type: categories[0],
      subtype: subcategory || undefined,
      description: categoryDescription || undefined,
    };

    setCategoriesData((prev) => {
      // If primary already exists, replace only index 0
      if (prev.length > 0) {
        const updated = [...prev];
        updated[0] = primary;
        return updated;
      }

      // Otherwise add as first category
      return [primary];
    });
  };

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const removeUploadedMedia = (indexToRemove: number) => {
    setUploadedSocialMedia((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // optional size check (1MB)
    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }

    setProfileImageUploading(true);

    try {
      const response = await uploadProfileMedia([file]);

      // backend returns array
      const uploaded = response[0];

      setProfileImageUrl(uploaded.url);
      setProfileImageFile(file);
    } catch (err) {
      console.error("Profile image upload failed", err);
    } finally {
      setProfileImageUploading(false);
    }
  };

  const handleHeaderImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (file.size > 2 * 1024 * 1024) {
      alert("Header image must be less than 2MB");
      return;
    }

    setHeaderImageUploading(true);

    try {
      const response = await uploadProfileMedia([file]);
      const uploaded = response[0];

      setHeaderImageUrl(uploaded.url);
      setHeaderImageFile(file);
    } catch (err) {
      console.error("Header image upload failed", err);
    } finally {
      setHeaderImageUploading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSocialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (invalidFiles.length > 0) {
      setUploadError(`Each file must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setUploadError("");
    setSocialFiles(files);
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

      const newSection = {
        Title: socialTitle || "Social Media",
        description: socialDescription || "",
        order:
          socialOrder !== "" ? socialOrder : uploadedSocialMedia.length + 1,
        imageUrls: response.map((file: any) => file.url),
      };

      setUploadedSocialMedia((prev) => [...prev, newSection]);

      // reset modal state
      setSocialFiles([]);
      setSocialTitle("");
      setSocialDescription("");
      setSocialOrder("");
      setShowSocialModal(false);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeSocialFile = (indexToRemove: number) => {
    setSocialFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
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

  const subcategorySuggestions = [
    "North Indian",
    "South Indian",
    "Chinese",
    "Continental",
    "Luxury Hotel",
    "Budget Hotel",
    "Resort",
    "Homestay",
    "Villa",
    "Travel Tech",
    "B2B Services",
  ];

  const filteredSubcategorySuggestions = subcategorySuggestions.filter(
    (item) =>
      item.toLowerCase().includes(subcategory.toLowerCase()) &&
      subcategory.length > 0
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      const imageSections = uploadedSocialMedia.map((section) => ({
        Title: section.Title,
        description: section.description,
        order: section.order,
        imageUrls: section.imageUrls,
      }));

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

        slug: formData.companyName.toLowerCase().replace(/\s+/g, "-"),

        verified_badge: false,
        founding_member: false,
        profile_status: "active",

        userId: user.id,
        email: user.email,
        profileImageUrl: profileImageUrl || undefined,
        headerImageUrl: headerImageUrl || undefined,

        // category: {
        //   type: categories[0] || "General",
        //   subtype: subcategory || undefined,
        //   description: categoryDescription || undefined,
        // },

        // categories: categoriesData,

        category_items:
          categoriesData.length > 0
            ? categoriesData.map((cat) => ({
                category: cat.type,
                sub_categories: cat.subtype ? [cat.subtype] : [],
                description: cat.description,
              }))
            : [
                {
                  category: categories[0] || "General",
                  sub_categories: subcategory ? [subcategory] : [],
                  description: categoryDescription || undefined,
                },
              ],

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
            {step === 1 && (
              <>
                <input
                  className="input text-black"
                  placeholder="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleFormChange}
                  required
                />

                {/* Category Tag Input */}
                <div className="relative" ref={categoryRef}>
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
                      placeholder={categories.length === 0 ? "Category" : ""}
                      className="flex-1 text-black outline-none min-w-[120px] px-2 py-1 text-sm bg-transparent"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            addCategory(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="px-3 py-2 text-sm text-black cursor-pointer hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subcategory Input */}
                <div className="relative">
                  <input
                    className="input text-black"
                    placeholder="Subcategory"
                    value={subcategory}
                    onChange={(e) => {
                      setSubcategory(e.target.value);
                      setShowSubSuggestions(true);
                    }}
                    onFocus={() => subcategory && setShowSubSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSubSuggestions(false), 150)
                    }
                  />

                  {showSubSuggestions &&
                    filteredSubcategorySuggestions.length > 0 && (
                      <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-40 overflow-y-auto">
                        {filteredSubcategorySuggestions.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSubcategory(item);
                              setShowSubSuggestions(false);
                            }}
                            className="px-3 py-2 text-sm text-black cursor-pointer hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <textarea
                  className="input h-20 resize-none text-black"
                  placeholder="Category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  style={{ paddingTop: "10px" }}
                />

                {categoriesData.slice(1).map((cat, index) => (
                  <div
                    key={index}
                    className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm"
                  >
                    <div className="font-semibold text-black">{cat.type}</div>

                    {cat.subtype && (
                      <div className="text-gray-700">
                        <span className="font-medium">Subcategory:</span>{" "}
                        {cat.subtype}
                      </div>
                    )}

                    {cat.description && (
                      <div className="text-gray-600">
                        <span className="font-medium">Description:</span>{" "}
                        {cat.description}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCategoryPopup(true)}
                    className="text-sm text-black font-medium underline"
                  >
                    + Add More Category
                  </button>
                </div>

                <textarea
                  className="input h-20 resize-none pt-3 text-black"
                  style={{
                    paddingTop: "10px",
                    // paddingBottom: "18px",
                  }}
                  placeholder="About (optional)"
                  name="about"
                  value={formData.about}
                  onChange={handleFormChange}
                />

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

                <button
                  type="button"
                  // onClick={() => setStep(2)}
                  onClick={() => {
                    savePrimaryCategory();
                    setStep(2);
                  }}
                  className="w-full h-12 bg-blue-600 text-white rounded-md"
                >
                  NEXT
                </button>
              </>
            )}

            {step === 2 && (
              <>
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

                <input
                  className="input text-black"
                  placeholder="Website link (optional)"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-12 border border-gray-300 rounded-md text-black"
                  >
                    BACK
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full h-12 bg-blue-600 text-white rounded-md"
                  >
                    NEXT
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="border rounded-md px-4 py-3 bg-gray-50 space-y-2">
                  <span className="text-gray-500 text-sm">
                    Profile Image
                    <span className="text-red-500 text-xs ml-2">
                      500x500px · max 1MB
                    </span>
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    {profileImageUrl ? (
                      <img
                        src={getMediaUrl(profileImageUrl)}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}

                    {/* Upload button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                      <span className="px-3 py-1 text-black border border-gray-300 bg-white rounded text-sm hover:bg-gray-100 transition font-medium">
                        {profileImageUploading ? "Uploading..." : "Choose file"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="border rounded-md px-4 py-3 bg-gray-50 space-y-2">
                  <span className="text-gray-500 text-sm">
                    Header Image
                    <span className="text-red-500 text-xs ml-2">
                      Recommended 1200×400 · max 2MB
                    </span>
                  </span>

                  {/* Preview */}
                  {headerImageUrl ? (
                    <img
                      src={getMediaUrl(headerImageUrl)}
                      alt="Header"
                      className="w-full h-32 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                      No Header Image
                    </div>
                  )}

                  {/* Upload */}
                  <label className="inline-block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeaderImageSelect}
                    />
                    <span className="px-3 py-1 text-black border border-gray-300 bg-white rounded text-sm hover:bg-gray-100 transition font-medium">
                      {headerImageUploading ? "Uploading..." : "Choose file"}
                    </span>
                  </label>
                </div>

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
                  <div className="mt-4 space-y-4">
                    {uploadedSocialMedia.map((section, index) => (
                      <div
                        key={index}
                        className="border rounded-md p-3 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-black">
                              {section.Title}
                            </p>
                            {section.description && (
                              <p className="text-sm text-gray-600">
                                {section.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Order: {section.order}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setUploadedSocialMedia((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-500 text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          {section.imageUrls.map(
                            (url: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={getMediaUrl(url)}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            )
                          )}
                        </div>
                      </div>
                    ))}
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
                  onClick={() => setStep(2)}
                  className="w-full h-12 border border-gray-300 rounded-md text-black"
                >
                  BACK
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full h-12 text-black border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  SKIP NOW
                </button>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}
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

              {/* Title */}
              <input
                type="text"
                placeholder="Title"
                value={socialTitle}
                onChange={(e) => setSocialTitle(e.target.value)}
                className="input text-black mb-2"
              />

              {/* Description */}
              <textarea
                placeholder="Description (optional)"
                value={socialDescription}
                onChange={(e) => setSocialDescription(e.target.value)}
                className="input h-20 resize-none text-black mb-0"
                style={{
                  paddingTop: "10px",
                }}
              />

              {/* Order */}
              <input
                type="number"
                placeholder="Order (optional)"
                value={socialOrder}
                onChange={(e) =>
                  setSocialOrder(e.target.value ? Number(e.target.value) : "")
                }
                className="input text-black mb-2"
              />

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
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {socialFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 border-b pb-2 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-gray-800 font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSocialFile(index)}
                        className="text-red-500 hover:text-red-700 text-lg font-bold leading-none px-2"
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="px-4 py-2 text-black border rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSocialMediaSave}
                  disabled={uploading || socialFiles.length === 0}
                  className={`px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 ${
                    uploading || socialFiles.length === 0
                      ? "opacity-70 cursor-not-allowed"
                      : ""
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

        {showCategoryPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4">
                Category {categoriesData.length + 1}
              </h2>

              {/* Category */}
              <input
                className="input text-black mb-2"
                placeholder="Category"
                value={popupCategory.type}
                onChange={(e) =>
                  setPopupCategory({ ...popupCategory, type: e.target.value })
                }
              />

              {/* Subcategory */}
              <input
                className="input text-black mb-2"
                placeholder="Subcategory"
                value={popupCategory.subtype}
                onChange={(e) =>
                  setPopupCategory({
                    ...popupCategory,
                    subtype: e.target.value,
                  })
                }
              />

              {/* Description */}
              <textarea
                className="input h-20 resize-none text-black"
                placeholder="Description"
                value={popupCategory.description}
                onChange={(e) =>
                  setPopupCategory({
                    ...popupCategory,
                    description: e.target.value,
                  })
                }
                style={{ paddingTop: "10px" }}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="px-4 py-2 text-black border rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!popupCategory.type) return;

                    setCategoriesData((prev) => {
                      // If primary category not saved yet, create it at index 0
                      if (prev.length === 0) {
                        return [
                          {
                            type: categories[0] || "General",
                            subtype: subcategory || undefined,
                            description: categoryDescription || undefined,
                          },
                          popupCategory, // Category 2
                        ];
                      }

                      return [...prev, popupCategory];
                    });

                    setPopupCategory({
                      type: "",
                      subtype: "",
                      description: "",
                    });
                    setShowCategoryPopup(false);
                  }}
                  className="px-4 py-2 bg-black text-white rounded-md"
                >
                  Save
                </button>
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
