"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { 
  completeOnboardingStep,
  getMyProfile,
} from "@/lib/profile";
import Image from "next/image";
import AuthLayout from "@/components/AuthLayout";
import { useToast } from "@/components/Toast";
import { useTeam } from "@/context/TeamContext";

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

const PURPLE = "#612178";
const PURPLE_LIGHT = "#E0CCF0";   // light purple circle for inactive steps
const PURPLE_DARK = "#8C4D9F";    // dark purple for inactive number & text

export default function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();
  const { refreshWorkspaces } = useTeam();
  
  // State for flow control
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    business_type: [] as string[],
    company_name: "",
    business_details: {} as Record<string, unknown>,
    preferred_collaborations: [] as string[],
    email: ""
  });

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
              company_name: profile.company_name || "",
              business_details: ((profile as unknown) as Record<string, unknown>).business_details as Record<string, unknown> || {},
              preferred_collaborations: ((profile as unknown) as { preferred_collaborations: string[] }).preferred_collaborations || [],
              email: profile.email || user.email || ""
            }));

            const step = ((profile as unknown) as { onboarding_step?: number }).onboarding_step 
              ? Math.min(((profile as unknown) as { onboarding_step: number }).onboarding_step, 4) 
              : 1;
            setCurrentStep(step);
          } else {
            // New user - pre-fill email
            setFormData(prev => ({
              ...prev,
              email: user.email || ""
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
        return {
          ...prev,
          business_type: prev.business_type.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          business_type: [...prev.business_type, type]
        };
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
        return {
          ...prev,
          preferred_collaborations: prev.preferred_collaborations.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          preferred_collaborations: [...prev.preferred_collaborations, type]
        };
      }
    });
    if (errors.preferred_collaborations) {
      setErrors((prev) => ({ ...prev, preferred_collaborations: "" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (formData.business_type.length === 0) {
        newErrors.business_type = "Please select at least one business type";
      }
    } else if (currentStep === 2) {
      if (!formData.company_name) {
        newErrors.company_name = "Establishment name is required";
      }
      const bts = formData.business_type;
      const details = formData.business_details;

      if (bts.includes("DMC")) {
        if (!details.areas_serviced || (details.areas_serviced as string[]).length === 0) {
          newErrors.areas_serviced = "Areas serviced is required for DMC";
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

      if (!requiresLocationAndCapacity && !requiresHotelDetails && !requiresDMC) {
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
    const step = stepToSubmit || currentStep;
    if (!validateStep()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      const payloadData: Record<string, unknown> = { step };

      if (step === 1) {
        payloadData.business_type = formData.business_type;
      } else if (step === 2) {
        payloadData.company_name = formData.company_name;
        payloadData.business_details = formData.business_details;
      } else if (step === 3) {
        payloadData.preferred_collaborations = formData.preferred_collaborations;
      } else if (step === 4) {
        // Nothing extra for 4, it just confirms completion
      }

      await completeOnboardingStep(payloadData);

      if (step < 4) {
        setCurrentStep(step + 1);
      } else {
        await refreshWorkspaces();
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
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  };

  const stepper = !isInitializing && (
      <div className="flex flex-wrap items-center justify-between w-full gap-2 sm:gap-1">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <React.Fragment key={stepNum}>
              {idx > 0 && (
                <span className="text-gray-400 text-sm mx-1 hidden sm:inline">&gt;</span>
              )}
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                  style={
                    isActive
                      ? { backgroundColor: PURPLE, color: "white" }
                      : isCompleted
                        ? { backgroundColor: PURPLE, color: "white" }
                        : { backgroundColor: PURPLE_LIGHT, color: PURPLE_DARK }
                  }
                >
                  {isCompleted ? "✓" : stepNum}
                </span>
                <span
                  className="text-sm font-medium"
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

  return (
    <AuthLayout variant="signup" header={stepper}>
      {isInitializing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading onboarding data...</p>
        </div>
      ) : (
        <div className="pt-2">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Who Are You ?</h3>
                    <p className="text-gray-600 text-sm mt-1">Select Your Business</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 text-white font-semibold text-sm whitespace-nowrap"
                    style={{ width: 220.75, height: 50, borderRadius: 16, backgroundColor: PURPLE }}
                    onClick={() => {}}
                  >
                    <span className="text-lg">+</span> Add Your Business
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full min-w-0 overflow-x-hidden">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.business_type.includes(type);
                    return (
                      <div 
                        key={type}
                        onClick={() => toggleBusinessType(type)}
                        className={`rounded-[16px] border-2 transition-all cursor-pointer flex flex-col overflow-hidden shrink-0 ${
                          isSelected ? "shadow-md" : "bg-white hover:shadow-sm"
                        }`}
                        style={
                          isSelected
                            ? {
                                width: 172.31,
                                height: 174.97,
                                borderColor: PURPLE,
                                background: "linear-gradient(114.72deg, #612178 16.64%, #801E7C 50.66%, #801E7C 94.01%)",
                              }
                            : {
                                width: 172.31,
                                height: 174.97,
                                borderColor: PURPLE_LIGHT,
                                backgroundColor: "#FFFFFF",
                              }
                        }
                      >
                        {BUSINESS_TYPE_IMAGES[type] && (
                          <div
                            className="relative overflow-hidden shrink-0 rounded-t-[16px]"
                            style={{ width: 172.31, height: 139.68 }}
                          >
                            <Image
                              src={BUSINESS_TYPE_IMAGES[type]!}
                              alt={type}
                              fill
                              className="object-cover object-center"
                            />
                          </div>
                        )}
                        <div className="flex-1 flex items-center justify-center min-h-[35px] px-2 py-1">
                          <h4 className={`font-bold text-sm text-center leading-tight ${isSelected ? "text-white" : "text-gray-900"}`}>{type}</h4>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {errors.business_type && <p className="text-red-500 text-sm font-bold mt-4 text-center">{errors.business_type}</p>}
              </div>
            )}

            {currentStep === 2 && renderStep2Fields()}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Business You Are Looking For. Select business you want to collaborate with</h3>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.preferred_collaborations.includes(type);
                    return (
                      <div 
                        key={type}
                        onClick={() => togglePreference(type)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? ""
                            : "border-gray-100 bg-white hover:border-purple-200"
                        }`}
                        style={isSelected ? { borderColor: PURPLE, backgroundColor: `${PURPLE}15` } : {}}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{type}</span>
                        {isSelected && (
                          <svg className="w-5 h-5" style={{ color: PURPLE }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.preferred_collaborations && <p className="text-red-500 text-sm font-bold mt-4 text-center">{errors.preferred_collaborations}</p>}
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">We Are Ready For You. Check The Details You Have Filled Till Now</h3>
                
                {/* Profile Card Summary */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="inline-block bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Setup {calculateCompletionPercentage()}%
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-6 pt-2">
                    <h4 className="text-2xl font-bold text-blue-900">{formData.company_name || "Company Name"}</h4>
                    <span className="text-sm font-medium text-gray-500 bg-white/60 self-start px-2 py-0.5 rounded-md">{formData.email || user?.email}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Category</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.business_type.map(type => (
                           <span key={type} className="text-sm font-semibold text-gray-800 bg-white px-2 py-1 rounded border border-blue-100">{type}</span>
                        ))}
                      </div>
                    </div>
                    
                    {formData.business_type.includes('Hotel') && (
                       <div className="space-y-1">
                         <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Hotel Stats</p>
                         <p className="text-sm font-semibold text-gray-800">{formData.business_details?.hotel_type as string || '-'}, {formData.business_details?.number_of_rooms as string || '-'} Rooms</p>
                       </div>
                    )}
                    {formData.business_type.includes('DMC') && (
                       <div className="space-y-1">
                         <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Areas Serviced</p>
                         <p className="text-sm font-semibold text-gray-800">{(formData.business_details?.areas_serviced as string[] || []).join(', ') || '-'}</p>
                       </div>
                    )}
                    {(formData.business_type.includes('Restaurant') || formData.business_type.includes('Ayurveda Centre')) && (
                       <div className="space-y-1">
                         <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Restaurant / Centre Stats</p>
                         <p className="text-sm font-semibold text-gray-800">{formData.business_details?.location as string || '-'}, Capacity: {formData.business_details?.capacity as string || '-'}</p>
                       </div>
                    )}

                    <div className="space-y-1 md:col-span-2 mt-2">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Business You Are Finding For</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.preferred_collaborations.map(type => (
                          <span key={type} className="px-2 py-1 bg-white text-blue-700 text-xs font-bold rounded-md shadow-sm border border-blue-50">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-blue-200/50">
                     <p className="text-sm text-center text-blue-800 font-medium">Complete profile now to get verified, or start finding businesses.</p>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 mt-4">
                <span>⚠️</span> {submitError}
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-6 mb-4">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: String(calculateCompletionPercentage()) + "%", backgroundColor: PURPLE }}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold text-sm rounded-full hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    GO BACK
                  </button>
                )}
              </div>
              {currentStep < 4 ? (
                <div className="flex gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      if(currentStep === 1 && formData.business_type.length === 0) {
                         setFormData({...formData, business_type: [BUSINESS_TYPES[0]]}); 
                      }
                      submitStep();
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center text-gray-700 font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ width: 144.51, height: 50, borderRadius: 16, backgroundColor: "#E6E6E6" }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => submitStep()}
                    disabled={isLoading}
                    className="flex items-center justify-center text-white font-semibold text-sm transition-all disabled:opacity-50"
                    style={{ width: 144.51, height: 50, borderRadius: 16, backgroundColor: PURPLE, boxShadow: "0px 4px 10px -2px #00000040" }}
                  >
                    {isLoading ? "PROCESSING..." : "Next"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-3 w-full md:justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white border-2 font-semibold text-sm rounded-full hover:bg-gray-50 transition-all disabled:opacity-50"
                    style={{ borderColor: PURPLE, color: PURPLE }}
                  >
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
      )}
    </AuthLayout>
  );
}