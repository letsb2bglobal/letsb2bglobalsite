"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { 
  completeOnboardingStep,
  getMyProfile,
} from "@/lib/profile";
import AuthLayout from "@/components/AuthLayout";
import Image from "next/image";
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

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center mb-2">
          <Image src="/headerB2B_logo.png" alt="Logo" width={100} height={40} className="object-contain mr-3" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Build your professional identity</p>
      </div>

      {isInitializing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading onboarding data...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Step {currentStep} of 4
              </span>
            </div>
            
            {/* Dynamic Progress Indicator */}
            <div className="flex items-center justify-between relative mb-6">
              <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
              
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    step < currentStep 
                    ? "bg-blue-600 text-white shadow-md" 
                    : step === currentStep
                      ? "bg-white border-2 border-blue-600 text-blue-600 shadow-md scale-110"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 md:p-8">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Who Are You? Select Your Business</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BUSINESS_TYPES.map(type => {
                    const isSelected = formData.business_type.includes(type);
                    return (
                      <div 
                        key={type}
                        onClick={() => toggleBusinessType(type)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 relative ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50/50 shadow-md" 
                            : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                        }`}
                      >
                        <h4 className={`font-bold text-sm ${isSelected ? "text-blue-900" : "text-gray-700"}`}>{type}</h4>
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full text-white">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
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
                            ? "border-blue-600 bg-blue-50/50" 
                            : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{type}</span>
                        {isSelected && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-2xl md:text-3xl font-black text-[#612178] leading-tight break-words pr-20">{formData.company_name || "Company Name"}</h4>
                      <span className="text-xs md:text-sm font-medium text-gray-500 bg-white/60 self-start px-2 py-1 rounded-md">{formData.email || user?.email}</span>
                    </div>
                    <span className="shrink-0 bg-white text-[#612178] text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-purple-100">
                      Setup {calculateCompletionPercentage()}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Category</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.business_type.map(type => (
                           <span key={type} className="text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm">{type}</span>
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
                    {formData.business_type.includes('Restaurant') || formData.business_type.includes('Ayurveda Centre') && (
                       <div className="space-y-1">
                         <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Details</p>
                         <p className="text-sm font-bold text-gray-800">{formData.business_details?.location as string || '-'}, Capacity: {formData.business_details?.capacity as string || '-'}</p>
                       </div>
                    )}

                    <div className="space-y-1 md:col-span-2 mt-2">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Collaborating With</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.preferred_collaborations.map(type => (
                          <span key={type} className="px-3 py-1.5 bg-white text-[#612178] text-[10px] font-black rounded-lg shadow-sm border border-purple-50">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-purple-200/50">
                     <p className="text-sm text-center text-purple-800 font-bold">Complete profile now to get verified, or start finding businesses.</p>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 mt-4">
                <span>⚠️</span> {submitError}
              </div>
            )}

            <div className="pt-8">
              <div className="flex flex-row items-stretch gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={isLoading}
                    className={`flex-1 py-4 px-2 bg-gray-50/50 border-2 border-gray-100 text-gray-500 font-bold text-[10px] md:text-xs rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50 uppercase tracking-widest ${currentStep === 4 ? '' : 'md:flex-none md:px-10'}`}
                  >
                    Go Back
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={() => submitStep()}
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-[#612178] text-white font-black text-sm rounded-2xl hover:bg-[#4d1a5f] transition-all shadow-lg hover:shadow-purple-100 disabled:opacity-50 uppercase tracking-widest"
                  >
                    {isLoading ? "PROCESSING..." : "NEXT →"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isLoading}
                      className="flex-1 py-4 px-2 bg-white border-2 border-[#612178] text-[#612178] font-black text-[9px] md:text-xs rounded-2xl hover:bg-purple-50 transition-all disabled:opacity-50 uppercase tracking-widest leading-tight"
                    >
                      Additional Info
                    </button>
                    <button
                      onClick={() => submitStep()}
                      disabled={isLoading}
                      className="flex-1 py-4 px-2 bg-[#612178] text-white font-black text-[9px] md:text-xs rounded-2xl hover:bg-[#4d1a5f] transition-all shadow-lg hover:shadow-purple-100 disabled:opacity-50 uppercase tracking-widest"
                    >
                      {isLoading ? "PROCESSING..." : "Get Started"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
