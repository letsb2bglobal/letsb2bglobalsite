"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { getMyProfile } from "@/lib/profile";
import Image from "next/image";
import AuthLayout from "@/components/AuthLayout";
import SignupHeader from "@/components/SignupHeader";
import { useToast } from "@/components/Toast";

const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel",
  "Taxi Business",
  "DMC",
  "Tour Guide",
  "TT Bus Services",
  "Adventure Activity",
  "Ayurveda Centre"
];

const BUSINESS_TYPE_IMAGES: Record<string, string> = {
  Restaurant: "/Restaurant.png",
  Hotel: "/hotel.png",
  "Taxi Business": "/taxi_business.png",
  DMC: "/DMC.png",
  "Tour Guide": "/tour_guid.png",
  "TT Bus Services": "/tt_busservies.png",
  "Adventure Activity": "/adventure_activity.png",
  "Ayurveda Centre": "/Ayurveda_Centre.png",
};

const STEP_LABELS = [
  "Business Type",
  "Business Information",
  "Preference",
  "Preview"
];

const HOTEL_TYPE_OPTIONS = ["5 Star", "4 Star", "3 Star", "Resort", "Boutique", "Budget", "Other"];

/* DMC, Travel Agents, Taxi, TT Travel, Adventure Activity - same form (Establishment Name + Areas You Service) */
const DMC_STYLE_TYPES = ["DMC", "Tour Guide", "Taxi Business", "TT Bus Services", "Adventure Activity"];

/* Restaurant & Ayurveda Centre - same form (Establishment Name + Location + Capacity) */
const RESTAURANT_STYLE_TYPES = ["Restaurant", "Ayurveda Centre"];
const LOCATION_OPTIONS = ["Kochi", "Mumbai", "Delhi", "Bangalore", "Dubai", "Kuwait", "Singapore", "Other"];

const PURPLE = "#612178";
const PURPLE_LIGHT = "#E0CCF0";   // light purple circle for inactive steps
const PURPLE_DARK = "#8C4D9F";    // dark purple for inactive number & text

interface FormData {
  business_type: string[];
  company_name: string;
  business_details: Record<string, unknown>;
  preferred_collaborations: string[];
  email: string;
}

const initialFormData: FormData = {
  business_type: [],
  company_name: "",
  business_details: {},
  preferred_collaborations: [],
  email: "",
};

export default function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();
  
  // State for flow control
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showBusinessAddedModal, setShowBusinessAddedModal] = useState(false);
  const [showPreferenceAfterAdd, setShowPreferenceAfterAdd] = useState(false);
  const [cameFromAddFlow, setCameFromAddFlow] = useState(false);
  const [addBusinessForm, setAddBusinessForm] = useState({ businessName: "", description: "" });
  const [areaInputValue, setAreaInputValue] = useState("");
  const [showAddAdditionalDetailsModal, setShowAddAdditionalDetailsModal] = useState(false);
  const [additionalDetailsForm, setAdditionalDetailsForm] = useState({
    companyName: "",
    businessType: "",
    capacity: "",
    description: "",
    languages: [] as string[],
    languageInput: "",
    website: "",
    country: "",
    state: "",
    city: "",
    contactPerson: "",
    designation: "",
    email: "",
    phoneCode: "+91",
    phone: "",
  });

  // Form State
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Open Add Additional Details when ?view=additional-details
  useEffect(() => {
    if (searchParams.get("view") === "additional-details") {
      setCurrentStep(4);
      setShowAddAdditionalDetailsModal(true);
    }
  }, [searchParams]);

  // Check if profile exists and potentially resume
  useEffect(() => {
    async function initProfile() {
      if (user) {
        try {
          const { exists, profile } = await getMyProfile(user.id);
          
          if (exists && profile) {
            if (profile.profile_status === "active" || profile.profile_status === "ACTIVE" as string) {
              router.push("/");
              return;
            }

            // Map existing data (business_type is now an array of strings in Strapi DB)
            const rawTypes = profile.business_type;
            let initialBusinessTypes: string[] = [];
            if (Array.isArray(rawTypes)) {
              initialBusinessTypes = rawTypes as string[];
            } else if (typeof rawTypes === "string" && rawTypes) {
              // Backward compatibility if it was saved as a string
              try {
                 initialBusinessTypes = JSON.parse(rawTypes);
                 if (!Array.isArray(initialBusinessTypes)) initialBusinessTypes = [rawTypes];
              } catch {
                 initialBusinessTypes = [rawTypes];
              }
            }

            setFormData(prev => ({
              ...prev,
              business_type: initialBusinessTypes,
              company_name: String(profile.company_name ?? ""),
              business_details: ((profile as unknown) as Record<string, unknown>).business_details as Record<string, unknown> || {},
              preferred_collaborations: ((profile as unknown) as { preferred_collaborations: string[] }).preferred_collaborations || [],
              email: String(profile.email ?? user.email ?? "")
            }));

            const step = ((profile as unknown) as { onboarding_step?: number }).onboarding_step 
              ? Math.min(((profile as unknown) as { onboarding_step: number }).onboarding_step, 4) 
              : 1;
            setCurrentStep(step);
          } else {
            // New user - pre-fill email
            setFormData(prev => ({
              ...prev,
              email: String(user.email ?? "")
            }));
          }
        } catch (err) {
          console.error("Error initializing profile:", err);
        } finally {
          setIsInitializing(false);
        }
      }
    }
    initProfile();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const updateDetails = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      business_details: { ...prev.business_details, [key]: value }
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const toggleBusinessType = (type: string) => {
    setFormData((prev) => {
      const isSelected = prev.business_type.includes(type);
      if (isSelected) {
        return { ...prev, business_type: [] };
      } else {
        return { ...prev, business_type: [type] };
      }
    });
    if (errors.business_type) {
      setErrors((prev) => ({ ...prev, business_type: "" }));
    }
  };

  const togglePreference = (type: string) => {
    setFormData((prev) => {
      const isSelected = prev.preferred_collaborations.includes(type);
      if (isSelected) {
        return { ...prev, preferred_collaborations: [] };
      } else {
        return { ...prev, preferred_collaborations: [type] };
      }
    });
    if (errors.preferred_collaborations) {
      setErrors((prev) => ({ ...prev, preferred_collaborations: "" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (showPreferenceAfterAdd) {
        if (formData.preferred_collaborations.length === 0) {
          newErrors.preferred_collaborations = "Please select at least one preferred collaboration";
        }
      } else if (formData.business_type.length === 0) {
        newErrors.business_type = "Please select at least one business type";
      }
    } else if (currentStep === 2) {
      if (!formData.company_name) {
        newErrors.company_name = "Establishment name is required";
      }
      const bts = formData.business_type;
      const details = formData.business_details;

      if (DMC_STYLE_TYPES.some((t) => bts.includes(t))) {
        if (!details.areas_serviced || (details.areas_serviced as string[]).length === 0) {
          newErrors.areas_serviced = "Please add at least one area you service";
        }
      }
      if (bts.includes("Restaurant") || bts.includes("Ayurveda Centre")) {
        if (!details.location) newErrors.location = "Location is required for your Restaurant / Centre";
        if (!details.capacity) newErrors.capacity = "Capacity is required for your Restaurant / Centre";
      }
      if (bts.includes("Hotel")) {
        if (!details.hotel_type) newErrors.hotel_type = "Hotel type is required";
        if (!details.number_of_rooms) newErrors.number_of_rooms = "Number of rooms is required";
      }
      
      const requiresLocationAndCapacity = bts.includes("Restaurant") || bts.includes("Ayurveda Centre");
      const requiresHotelDetails = bts.includes("Hotel");
      const requiresDMC = bts.includes("DMC");
      const requiresDmcStyle = DMC_STYLE_TYPES.some((t) => bts.includes(t));

      if (!requiresLocationAndCapacity && !requiresHotelDetails && !requiresDMC && !requiresDmcStyle) {
         if (!details.location) newErrors.location = "Location is required";
      }

    } else if (currentStep === 3) {
      if (formData.preferred_collaborations.length === 0) {
         newErrors.preferred_collaborations = "Please select at least one preferred collaboration";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitStep = async (stepToSubmit?: number) => {
    const step = stepToSubmit ?? currentStep;
    if (!validateStep()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      // API disabled for now - advance steps locally
      // Add flow: Step 2 -> Step 4 (skip 3); Who Are You flow: Step 2 -> Step 3
      let nextStep = step < 4 ? step + 1 : 4;
      if (step === 2 && cameFromAddFlow) {
        nextStep = 4;
        setCameFromAddFlow(false);
      }

      if (step < 4) {
        setCurrentStep(Math.min(nextStep, 4));
      } else {
        showToast("Profile set up successfully", "success");
        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Step submit error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to save progress");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep2Fields = () => {
    const bts = formData.business_type;
    const details = formData.business_details;

    const hasDMC = bts.includes("DMC");
    const hasRestaurantOrCentre = bts.includes("Restaurant") || bts.includes("Ayurveda Centre");
    const hasHotel = bts.includes("Hotel");
    const requiresDefaultLocation = !hasDMC && !hasRestaurantOrCentre && !hasHotel;
    const hotelOnly = hasHotel && !hasDMC && !hasRestaurantOrCentre;
    const dmcStyleOnly = DMC_STYLE_TYPES.some((t) => bts.includes(t)) && !hasHotel && !hasRestaurantOrCentre;
    const selectedDmcStyleType = bts.find((t) => DMC_STYLE_TYPES.includes(t)) || "DMC";
    const restaurantStyleOnly = RESTAURANT_STYLE_TYPES.some((t) => bts.includes(t)) && !hasHotel && !hasDMC;
    const selectedRestaurantStyleType = bts.find((t) => RESTAURANT_STYLE_TYPES.includes(t)) || "Restaurant";

    /* Hotel form per Figma - when Hotel is selected */
    if (hotelOnly) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Lets learn more about your{" "}
              <span style={{ color: PURPLE }}>Hotel</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">Enter Your Business Detail Below</p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Hotel Name"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.company_name ? "border-red-500" : ""}`}
              />
              {errors.company_name && <p className="text-red-500 text-xs font-bold mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <select
                value={(details.hotel_type as string) || ""}
                onChange={(e) => updateDetails("hotel_type", e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.hotel_type ? "border-red-500" : ""}`}
              >
                <option value="">Hotel Type</option>
                {HOTEL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.hotel_type && <p className="text-red-500 text-xs font-bold mt-1">{errors.hotel_type}</p>}
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                value={(details.number_of_rooms as string) || ""}
                onChange={(e) => updateDetails("number_of_rooms", e.target.value)}
                placeholder="No. Of Rooms You Have"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.number_of_rooms ? "border-red-500" : ""}`}
              />
              {errors.number_of_rooms && <p className="text-red-500 text-xs font-bold mt-1">{errors.number_of_rooms}</p>}
            </div>
          </div>
        </div>
      );
    }

    /* DMC, Taxi, TT Bus, Tour Guide form per Figma */
    if (dmcStyleOnly) {
      const areas = (details.areas_serviced as string[]) || [];
      const addArea = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !areas.includes(trimmed)) {
          updateDetails("areas_serviced", [...areas, trimmed]);
          setAreaInputValue("");
        }
      };
      const removeArea = (idx: number) => {
        updateDetails("areas_serviced", areas.filter((_, i) => i !== idx));
      };
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Lets learn more about your{" "}
              <span style={{ color: PURPLE }}>{selectedDmcStyleType} business</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">Enter Your Business Detail Below</p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Establishment Name"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.company_name ? "border-red-500" : ""}`}
              />
              {errors.company_name && <p className="text-red-500 text-xs font-bold mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <div className={`min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg bg-white focus-within:border-[#612178] transition-colors ${errors.areas_serviced ? "border-red-500" : ""}`}>
                <input
                  type="text"
                  value={areaInputValue}
                  onChange={(e) => setAreaInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addArea(areaInputValue || (e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={() => areaInputValue.trim() && addArea(areaInputValue)}
                  placeholder="Areas You Service"
                  className="w-full min-w-[120px] py-2 border-0 outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
                />
                {areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areas.map((area, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium"
                        style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}
                      >
                        #{area}
                        <button
                          type="button"
                          onClick={() => removeArea(idx)}
                          className="ml-0.5 hover:opacity-70 text-current"
                          aria-label={`Remove ${area}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {errors.areas_serviced && <p className="text-red-500 text-xs font-bold mt-1">{errors.areas_serviced}</p>}
            </div>
          </div>
        </div>
      );
    }

    /* Restaurant & Ayurveda Centre form per Figma */
    if (restaurantStyleOnly) {
      const capacityPlaceholder = selectedRestaurantStyleType === "Restaurant" ? "Restaurant Capacity" : "Ayurveda Centre Capacity";
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Lets learn more about your{" "}
              <span style={{ color: PURPLE }}>{selectedRestaurantStyleType}</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">Enter Your Business Detail Below</p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Establishment Name"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.company_name ? "border-red-500" : ""}`}
              />
              {errors.company_name && <p className="text-red-500 text-xs font-bold mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <select
                value={(details.location as string) || ""}
                onChange={(e) => updateDetails("location", e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.location ? "border-red-500" : ""}`}
              >
                <option value="">Location</option>
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.location && <p className="text-red-500 text-xs font-bold mt-1">{errors.location}</p>}
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                value={(details.capacity as string) || ""}
                onChange={(e) => updateDetails("capacity", e.target.value)}
                placeholder={capacityPlaceholder}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors ${errors.capacity ? "border-red-500" : ""}`}
              />
              {errors.capacity && <p className="text-red-500 text-xs font-bold mt-1">{errors.capacity}</p>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Let&apos;s learn more about your business. Enter Your Business Details Below</h3>
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Establishment / Company Name</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            placeholder="e.g. Grand Palace Hotel"
            className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.company_name ? "border-red-500" : "border-gray-200"}`}
          />
          {errors.company_name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.company_name}</p>}
        </div>

        {hasDMC && (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-bold text-blue-900 flex items-center gap-2">
               <span className="text-xl">🌍</span> DMC Details
            </h4>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Areas You Service</label>
              <input
                type="text"
                value={(details.areas_serviced as string[] || []).join(", ")}
                onChange={(e) => updateDetails('areas_serviced', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                placeholder="e.g. Kochi, Kuwait, Dubai"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.areas_serviced ? "border-red-500" : "border-blue-200"}`}
              />
              {errors.areas_serviced && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.areas_serviced}</p>}
            </div>
          </div>
        )}

        {hasRestaurantOrCentre && (
          <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-bold text-orange-900 flex items-center gap-2">
               <span className="text-xl">🍽️</span> Restaurant / Centre Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location</label>
                <input
                  type="text"
                  value={details.location as string || ""}
                  onChange={(e) => updateDetails('location', e.target.value)}
                  placeholder="e.g. MG Road, Bengaluru"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.location ? "border-red-500" : "border-orange-200"}`}
                />
                {errors.location && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.location}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Capacity</label>
                <input
                  type="number"
                  value={details.capacity as string || ""}
                  onChange={(e) => updateDetails('capacity', e.target.value)}
                  placeholder="e.g. 150"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.capacity ? "border-red-500" : "border-orange-200"}`}
                />
                {errors.capacity && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.capacity}</p>}
              </div>
            </div>
          </div>
        )}

        {hasHotel && (
          <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-100 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-bold text-purple-900 flex items-center gap-2">
               <span className="text-xl">🏨</span> Hotel Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Hotel Type</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Star, Resort, Boutique"
                  value={details.hotel_type as string || ""}
                  onChange={(e) => updateDetails('hotel_type', e.target.value)}
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all ${errors.hotel_type ? "border-red-500" : "border-purple-200"}`}
                />
                {errors.hotel_type && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.hotel_type}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">No. Of Rooms</label>
                <input
                  type="number"
                  value={details.number_of_rooms as string || ""}
                  onChange={(e) => updateDetails('number_of_rooms', e.target.value)}
                  placeholder="e.g. 45"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all ${errors.number_of_rooms ? "border-red-500" : "border-purple-200"}`}
                />
                {errors.number_of_rooms && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.number_of_rooms}</p>}
              </div>
            </div>
          </div>
        )}

        {requiresDefaultLocation && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location / Service Area</label>
            <input
              type="text"
              value={details.location as string || ""}
              onChange={(e) => updateDetails('location', e.target.value)}
              placeholder="e.g. Mumbai"
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.location ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.location && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.location}</p>}
          </div>
        )}
      </div>
    );
  };

  const calculateCompletionPercentage = () => {
    if (showPreferenceAfterAdd) return 75;
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  };

  const stepper = !isInitializing && (
      <div className="flex flex-nowrap sm:flex-wrap items-center justify-between sm:justify-between w-full gap-2 sm:gap-1 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1 min-w-0">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const effectiveStep = showAddBusinessModal ? 2 : showPreferenceAfterAdd ? 3 : currentStep;
          const isActive = effectiveStep === stepNum;
          const isCompleted = effectiveStep > stepNum;
          return (
            <React.Fragment key={stepNum}>
              {idx > 0 && (
                <span className="text-gray-400 text-sm mx-1 hidden sm:inline">&gt;</span>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300"
                  style={
                    isActive
                      ? { backgroundColor: PURPLE, color: "white" }
                      : isCompleted
                        ? { backgroundColor: PURPLE, color: "white" }
                        : { backgroundColor: PURPLE_LIGHT, color: PURPLE_DARK }
                  }
                >
                  {stepNum}
                </span>
                <span
                  className="text-xs sm:text-sm font-medium whitespace-nowrap"
                  style={
                    isActive
                      ? { color: "#9b6ea8" }
                      : isCompleted
                        ? { color: PURPLE }
                        : { color: PURPLE_DARK }
                  }
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );

  const handleAddBusiness = () => {
    if (addBusinessForm.businessName.trim()) {
      setFormData(prev => ({
        ...prev,
        company_name: addBusinessForm.businessName,
        business_details: { ...prev.business_details, description: addBusinessForm.description },
      }));
      setShowBusinessAddedModal(true);
    }
  };

  const handleBusinessAddedContinue = () => {
    setAddBusinessForm({ businessName: "", description: "" });
    setShowBusinessAddedModal(false);
    setShowAddBusinessModal(false);
    setShowPreferenceAfterAdd(true);
  };

  const handlePreferenceAfterAddNext = () => {
    if (formData.preferred_collaborations.length === 0) {
      setErrors({ preferred_collaborations: "Please select at least one preferred collaboration" });
      return;
    }
    setErrors({});
    setShowPreferenceAfterAdd(false);
    setCameFromAddFlow(true);
    setCurrentStep(2);
  };

  const handlePreferenceAfterAddSkip = () => {
    setErrors({});
    setShowPreferenceAfterAdd(false);
    setCameFromAddFlow(true);
    setCurrentStep(4); // Skip from Add flow's preference → go to Preview
  };

  const handleSkip = () => {
    setErrors({});
    if (showPreferenceAfterAdd) {
      handlePreferenceAfterAddSkip();
      return;
    }
    if (currentStep === 1) {
      setCurrentStep(3); // Business Type → Preference
    } else if (currentStep === 2) {
      setCurrentStep(3); // Business Information → Preference
    } else if (currentStep === 3) {
      setCurrentStep(4); // Preference → Preview
    }
  };

  return (
    <AuthLayout variant="signup" header={stepper} hideCardStyle={false} noInnerScroll>
      {isInitializing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading onboarding data...</p>
        </div>
      ) : (
        <div className="pt-2 pb-8 overflow-x-hidden min-w-0">
            {currentStep === 1 && (
              showAddBusinessModal ? (
              /* Add Your Unique Business - uses same AuthLayout card as Who Are You (no extra wrapper) */
              <div key="add-business" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Your Unique Business</h3>
                      <p className="text-sm text-gray-600 mt-1">Enter Your Business Detail Below</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Business Name</label>
                        <input
                          type="text"
                          value={addBusinessForm.businessName}
                          onChange={(e) => setAddBusinessForm(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Business Name"
                          className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#612178] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Add Description</label>
                        <textarea
                          value={addBusinessForm.description}
                          onChange={(e) => setAddBusinessForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Add Description"
                          rows={4}
                          className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white resize-none focus:outline-none focus:border-[#612178] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <div className="w-full sm:w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: "25%", backgroundColor: PURPLE }}
                        />
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={handleAddBusiness}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
                          style={{ backgroundColor: PURPLE, boxShadow: "0px 4px 10px -2px rgba(0,0,0,0.25)" }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
              </div>
              ) : showPreferenceAfterAdd ? (
              /* Business You Are Looking For - same design as Who Are You (image cards), no Add button */
              <div key="preference-after-add" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Business You Are Looking For</h3>
                  <p className="text-gray-600 text-sm mt-1">Select Business you want to collaborate with</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-[repeat(4,120px)] gap-3 sm:gap-4 lg:justify-between w-full min-w-0">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.preferred_collaborations.includes(type);
                    return (
                      <div
                        key={type}
                        onClick={() => togglePreference(type)}
                        className="w-full max-w-[160px] sm:max-w-none justify-self-center sm:justify-self-auto h-[100px] sm:h-[120px] rounded-2xl border-2 transition-all cursor-pointer flex flex-col overflow-hidden"
                        style={
                          isSelected
                            ? {
                                borderColor: PURPLE,
                                background: "linear-gradient(114.72deg, #612178 16.64%, #801E7C 50.66%, #801E7C 94.01%)",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                            : {
                                borderColor: "#E8D5F0",
                                backgroundColor: "#FFFFFF",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                        }
                      >
                        {BUSINESS_TYPE_IMAGES[type] && (
                          <div className="relative w-full flex-1 min-h-0 rounded-t-[14px] overflow-hidden">
                            <Image
                              src={BUSINESS_TYPE_IMAGES[type]!}
                              alt={type}
                              fill
                              className="object-cover object-center"
                              sizes="120px"
                            />
                          </div>
                        )}
                        <div className="flex-shrink-0 flex items-center justify-center h-8 px-1.5 py-0.5">
                          <h4 className={`font-bold text-[11px] text-center leading-tight truncate max-w-full ${isSelected ? "text-white" : "text-gray-900"}`}>{type}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.preferred_collaborations && <p className="text-red-500 text-sm font-bold mt-4 text-left">{errors.preferred_collaborations}</p>}
              </div>
              ) : (
              /* Who Are You - Select Your Business (Figma alignment) */
              <div key="who-are-you" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Who Are You ?</h3>
                    <p className="text-gray-600 text-sm mt-1">Select Your Business</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 w-full sm:w-[220.75px] h-12 sm:h-[50px] text-white font-semibold text-sm whitespace-nowrap shrink-0 rounded-2xl"
                    style={{ backgroundColor: PURPLE }}
                    onClick={() => setShowAddBusinessModal(true)}
                  >
                    <span className="text-lg">+</span> Add Your Business
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-[repeat(4,120px)] gap-3 sm:gap-4 lg:justify-between w-full min-w-0">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.business_type.includes(type);
                    return (
                      <div 
                        key={type}
                        onClick={() => toggleBusinessType(type)}
                        className="w-full max-w-[160px] sm:max-w-none justify-self-center sm:justify-self-auto h-[100px] sm:h-[120px] rounded-2xl border-2 transition-all cursor-pointer flex flex-col overflow-hidden"
                        style={
                          isSelected
                            ? {
                                borderColor: PURPLE,
                                background: "linear-gradient(114.72deg, #612178 16.64%, #801E7C 50.66%, #801E7C 94.01%)",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                            : {
                                borderColor: "#E8D5F0",
                                backgroundColor: "#FFFFFF",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                        }
                      >
                        {BUSINESS_TYPE_IMAGES[type] && (
                          <div className="relative w-full flex-1 min-h-0 rounded-t-[14px] overflow-hidden">
                            <Image
                              src={BUSINESS_TYPE_IMAGES[type]!}
                              alt={type}
                              fill
                              className="object-cover object-center"
                              sizes="120px"
                            />
                          </div>
                        )}
                        <div className="flex-shrink-0 flex items-center justify-center h-8 px-1.5 py-0.5">
                          <h4 className={`font-bold text-[11px] text-center leading-tight truncate max-w-full ${isSelected ? "text-white" : "text-gray-900"}`}>{type}</h4>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {errors.business_type && <p className="text-red-500 text-sm font-bold mt-4 text-left">{errors.business_type}</p>}
              </div>
              )
            )}

            {currentStep === 2 && renderStep2Fields()}

            {currentStep === 3 && (
              /* Step 3 Preference - same design as Who Are You (image cards), no Add button */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Business You Are Looking For</h3>
                  <p className="text-gray-600 text-sm mt-1">Select Business you want to collaborate with</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-[repeat(4,120px)] gap-3 sm:gap-4 lg:justify-between w-full min-w-0">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.preferred_collaborations.includes(type);
                    return (
                      <div
                        key={type}
                        onClick={() => togglePreference(type)}
                        className="w-full max-w-[160px] sm:max-w-none justify-self-center sm:justify-self-auto h-[100px] sm:h-[120px] rounded-2xl border-2 transition-all cursor-pointer flex flex-col overflow-hidden"
                        style={
                          isSelected
                            ? {
                                borderColor: PURPLE,
                                background: "linear-gradient(114.72deg, #612178 16.64%, #801E7C 50.66%, #801E7C 94.01%)",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                            : {
                                borderColor: "#E8D5F0",
                                backgroundColor: "#FFFFFF",
                                boxShadow: "2px 5px 13px 0px #E1C0EC",
                              }
                        }
                      >
                        {BUSINESS_TYPE_IMAGES[type] && (
                          <div className="relative w-full flex-1 min-h-0 rounded-t-[14px] overflow-hidden">
                            <Image
                              src={BUSINESS_TYPE_IMAGES[type]!}
                              alt={type}
                              fill
                              className="object-cover object-center"
                              sizes="120px"
                            />
                          </div>
                        )}
                        <div className="flex-shrink-0 flex items-center justify-center h-8 px-1.5 py-0.5">
                          <h4 className={`font-bold text-[11px] text-center leading-tight truncate max-w-full ${isSelected ? "text-white" : "text-gray-900"}`}>{type}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.preferred_collaborations && <p className="text-red-500 text-sm font-bold mt-4 text-left">{errors.preferred_collaborations}</p>}
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">We Are Ready For You</h3>
                <p className="text-gray-600 text-sm mb-6">Check The Details You Have Filled Till Now</p>

                {/* Profile visuals - cover banner + profile pic */}
                <div className="relative rounded-2xl overflow-hidden mb-6">
                  <div className="h-32 sm:h-40 w-full relative" style={{ backgroundColor: PURPLE_LIGHT }}>
                    <button type="button" className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: PURPLE }} aria-label="Edit cover">
                      <Image src="/cover_cameralogo.png" alt="" width={20} height={20} className="object-contain" />
                    </button>
                  </div>
                  <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    <Image src="/profile_cameralogo.png" alt="" width={40} height={40} className="object-contain" />
                  </div>
                </div>

                {/* Business info - company name with Edit */}
                <div className="pt-14 sm:pt-12 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{String(formData.company_name || "Company Name")}</h4>
                    <span className="text-sm text-gray-600">{String(formData.email || (user?.email != null ? user.email : ""))}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm shrink-0"
                    style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE, border: `2px solid ${PURPLE}` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </div>

                {/* Business stats - Hotel/DMC/Restaurant details */}
                {(formData.business_type.length > 0 || !!(formData.business_details?.hotel_type || formData.business_details?.areas_serviced)) && (
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-800 mb-6">
                    {formData.business_type.includes("Hotel") && (
                      <>
                        <span>{String(formData.business_details?.hotel_type ?? "-")}</span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PURPLE }} />
                        <span>{String(formData.business_details?.number_of_rooms ?? "-")} Rooms</span>
                      </>
                    )}
                    {DMC_STYLE_TYPES.some((t) => formData.business_type.includes(t)) && (
                      <span>{((formData.business_details?.areas_serviced as string[] | undefined) ?? []).join(", ") || "-"}</span>
                    )}
                    {(formData.business_type.includes("Restaurant") || formData.business_type.includes("Ayurveda Centre")) && (
                      <>
                        <span>{String(formData.business_details?.location ?? "-")}</span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PURPLE }} />
                        <span>Capacity: {String(formData.business_details?.capacity ?? "-")}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Business You Are Finding For - tags with x and + */}
                <div className="mb-8">
                  <p className="text-base font-bold text-gray-900 mb-3">Business You Are Finding For</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.preferred_collaborations.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-800 bg-gray-100"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, preferred_collaborations: prev.preferred_collaborations.filter((t) => t !== type) }))}
                          className="hover:opacity-70 text-gray-600"
                          aria-label={`Remove ${type}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: PURPLE }}
                      aria-label="Add business type"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Profile completion + message */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-t" style={{ borderColor: PURPLE_LIGHT }}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path fill="none" stroke="#E5E7EB" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path fill="none" strokeWidth="3" strokeDasharray={`${calculateCompletionPercentage()}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: PURPLE }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: PURPLE }}>
                        {calculateCompletionPercentage()}%
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Profile Completed</p>
                      <p className="text-sm text-gray-600">Complete profile now to get verified, or start finding businesses.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 mt-4">
                <span>⚠️</span> {submitError}
              </div>
            )}

            {/* Progress bar left, buttons right - shown for Who Are You and preference-after-add */}
            {!showAddBusinessModal && (
            <>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: String(calculateCompletionPercentage()) + "%", backgroundColor: PURPLE }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end items-stretch sm:items-center">
                {currentStep < 4 ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full sm:w-[144.51px] h-12 sm:h-[50px] text-gray-700 font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 rounded-2xl"
                    style={{ backgroundColor: "#E6E6E6" }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => (showPreferenceAfterAdd ? handlePreferenceAfterAddNext() : submitStep())}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full sm:w-[144.51px] h-12 sm:h-[50px] text-white font-semibold text-sm transition-all disabled:opacity-50 rounded-2xl"
                    style={{ backgroundColor: PURPLE, boxShadow: "0px 4px 10px -2px #00000040" }}
                  >
                    {isLoading ? "PROCESSING..." : "Next"}
                  </button>
                </div>
                ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
                  <button
                    onClick={() => setShowAddAdditionalDetailsModal(true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 font-semibold text-sm rounded-full hover:bg-gray-50 transition-all disabled:opacity-50"
                    style={{ borderColor: PURPLE, color: PURPLE }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Additional Info
                  </button>
                  <button
                    onClick={() => submitStep()}
                    disabled={isLoading}
                    className="px-6 py-3 text-white font-semibold text-sm rounded-full transition-all disabled:opacity-50"
                    style={{ backgroundColor: PURPLE }}
                  >
                    {isLoading ? "PROCESSING..." : "Lets Find Other Business"}
                  </button>
                </div>
                )}
              </div>
            </div>
            </>
            )}

            {/* Add Additional Details modal */}
            {showAddAdditionalDetailsModal && (
              <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
                <SignupHeader sticky={false} />
                <div className="flex flex-1 min-h-0">
                  {/* Left Sidebar */}
                  <div className="hidden lg:flex flex-col w-64 shrink-0 p-6 border-r border-gray-200" style={{ backgroundColor: "#FAFAFA" }}>
                    <div className="flex flex-col items-center gap-2 mb-8">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                          <path fill="none" stroke="#E5E7EB" strokeWidth="2" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path fill="none" strokeWidth="2" strokeDasharray="25, 100" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: PURPLE }} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: PURPLE }}>25%</span>
                      </div>
                      <p className="text-sm font-semibold text-center" style={{ color: PURPLE }}>Profile Completed</p>
                      <p className="text-xs text-gray-500 text-center">Complete Your Profile To Be Verified</p>
                    </div>
                    <nav className="space-y-1">
                      <a href="#" className="block px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}>Company Information</a>
                      <a href="#" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Business Information</a>
                      <a href="#" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">KYC Verification</a>
                    </nav>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-gray-200">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Additional Details</h2>
                        <p className="text-sm text-gray-600 mt-0.5">This Info will be shown on your public profile.</p>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button type="button" onClick={() => setShowAddAdditionalDetailsModal(false)} className="px-4 py-2 rounded-lg font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={() => { setShowAddAdditionalDetailsModal(false); showToast("Details saved", "success"); }} className="px-4 py-2 rounded-lg font-semibold text-sm text-white" style={{ backgroundColor: PURPLE }}>Save</button>
                      </div>
                    </div>

                    <div className="flex-1 p-4 sm:p-6 min-h-0 overflow-visible">
                      <div className="max-w-2xl">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                          {/* Profile/Logo area */}
                          <div className="relative h-32 sm:h-40 rounded-xl mb-6 overflow-hidden" style={{ backgroundColor: PURPLE_LIGHT }}>
                            <button type="button" className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: PURPLE }} aria-label="Add cover">
                              <Image src="/cover_cameralogo.png" alt="" width={20} height={20} className="object-contain" />
                            </button>
                            <div className="absolute bottom-4 left-6 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow overflow-hidden">
                              <Image src="/profile_cameralogo.png" alt="" width={40} height={40} className="object-contain" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <input type="text" value={additionalDetailsForm.companyName || formData.company_name} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Company Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <select value={additionalDetailsForm.businessType || formData.business_type[0]} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, businessType: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                <option value="">Business Type</option>
                                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <input type="text" value={additionalDetailsForm.capacity || (formData.business_details?.number_of_rooms as string) || (formData.business_details?.capacity as string)} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, capacity: e.target.value }))} placeholder="24 Rooms" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                            </div>
                            <div>
                              <textarea value={additionalDetailsForm.description || (formData.business_details?.description as string)} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Provide A Description Of Your Company" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400 resize-none" />
                            </div>
                            <div>
                              <select value={additionalDetailsForm.languageInput} onChange={(e) => { const v = e.target.value; if (v) { setAdditionalDetailsForm(p => ({ ...p, languages: [...p.languages, v], languageInput: "" })); } }} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                <option value="">Select Languages Preferred</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Malayalam">Malayalam</option>
                              </select>
                              {additionalDetailsForm.languages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {additionalDetailsForm.languages.map((l, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm bg-gray-100 text-gray-800">
                                      {l}
                                      <button type="button" onClick={() => setAdditionalDetailsForm(p => ({ ...p, languages: p.languages.filter((_, idx) => idx !== i) }))} className="hover:opacity-70">×</button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <input type="text" value={additionalDetailsForm.website} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, website: e.target.value }))} placeholder="Enter Website Link (Optional)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                            </div>
                            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm" style={{ color: PURPLE, border: `2px solid ${PURPLE}` }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              Add Social Media Profile
                            </button>
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="font-bold text-gray-900 mb-4">Location</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <select value={additionalDetailsForm.country} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, country: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                <option value="">Country</option>
                                <option value="India">India</option>
                                <option value="UAE">UAE</option>
                                <option value="Kuwait">Kuwait</option>
                              </select>
                              <select value={additionalDetailsForm.state} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, state: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                <option value="">State</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Karnataka">Karnataka</option>
                              </select>
                              <select value={additionalDetailsForm.city} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, city: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                <option value="">City</option>
                                <option value="Kochi">Kochi</option>
                                <option value="Bangalore">Bangalore</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="font-bold text-gray-900 mb-4">Contact Information</p>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" value={additionalDetailsForm.contactPerson} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, contactPerson: e.target.value }))} placeholder="Enter The Contact Person" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                                <select value={additionalDetailsForm.designation} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, designation: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                  <option value="">Select Designation</option>
                                  <option value="Manager">Manager</option>
                                  <option value="Owner">Owner</option>
                                  <option value="Director">Director</option>
                                </select>
                              </div>
                              <input type="email" value={additionalDetailsForm.email || formData.email || (user ? String(user.email) : "")} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                              <div className="flex gap-2">
                                <select value={additionalDetailsForm.phoneCode} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, phoneCode: e.target.value }))} className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 bg-white">
                                  <option value="+91">+91</option>
                                  <option value="+971">+971</option>
                                  <option value="+965">+965</option>
                                </select>
                                <input type="tel" value={additionalDetailsForm.phone} onChange={(e) => setAdditionalDetailsForm(p => ({ ...p, phone: e.target.value }))} placeholder="Enter Phone No." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#612178] text-gray-800 placeholder-gray-400" />
                              </div>
                              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm" style={{ color: PURPLE, border: `2px solid ${PURPLE}` }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Phone Number
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Added success modal */}
            {showBusinessAddedModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowBusinessAddedModal(false)}>
                <div
                  className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-lg animate-in fade-in zoom-in-95 duration-200"
                  style={{ boxShadow: "2px 5px 13px 0px #E1C0EC" }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleBusinessAddedContinue}
                    className="absolute top-4 right-4 p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">Business Added</h3>
                  <p className="mt-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                    Your business has been added!{" "}
                    <span className="font-semibold" style={{ color: PURPLE }}>
                      Our team will reach out to you soon.
                    </span>{" "}
                    In the meantime, feel free to continue with your onboarding.
                  </p>
                  <button
                    type="button"
                    onClick={handleBusinessAddedContinue}
                    className="mt-6 w-full py-3 rounded-xl font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: PURPLE, boxShadow: "0px 4px 10px -2px rgba(0,0,0,0.25)" }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </AuthLayout>
  );
}