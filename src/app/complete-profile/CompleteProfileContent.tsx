"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import { 
  completeProfileStep,
  getMyProfile,
} from "@/lib/profile";
import AuthLayout from "@/components/AuthLayout";
import Image from "next/image";
import { useToast } from "@/components/Toast";
import { useTeam } from "@/context/TeamContext";

type ProfileType = "Individual" | "Company" | "Association";

interface Category {
  category: string;
  sub_categories: string[];
  description: string;
}

const BUSINESS_TYPES = [
  "Travel Agent",
  "Tour Operator",
  "Destination Management Company (DMC)",
  "Handling Partner",
  "Hotel",
  "Resort",
  "Homestay",
  "Service Villas",
  "Apartments",
  "Houseboats",
  "Cruise Liners",
  "Transport Provider",
  "Activity / Experience Provider",
  "Wellness Centres",
  "Ayurveda Centres",
  "Medical Tourism Facilitators",
  "Tourism Associations",
  "Hospitality Institutions",
  "Training Organisations"
];

const TARGET_BUYER_TYPES = [
  "B2B",
  "B2C",
  "Both"
];

export default function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();
  const { refreshWorkspaces } = useTeam();
  
  // State for flow control
  const [currentStep, setCurrentStep] = useState(1);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 2: Identity
    full_name: "",
    email: "",
    mobile_number: "",
    company_name: "",
    contact_person_name: "",
    
    // Step 3: Classification
    business_type: "",
    target_buyer_type: "",
    category_items: [] as Category[],

    // Step 4: Location
    address: "",
    city: "",
    country: "",
    pincode: "",
    google_map_link: "",
  });

  const [currentCategory, setCurrentCategory] = useState<Category>({
    category: "",
    sub_categories: [],
    description: ""
  });
  const [subCategoryInput, setSubCategoryInput] = useState("");

  // Check if profile exists and potentially resume
  useEffect(() => {
    async function initProfile() {
      if (user) {
        try {
          const { exists, profile } = await getMyProfile(user.id);
          
          if (exists && profile) {
            if (profile.profile_status === "active") {
              router.push("/");
              return;
            }

            // Resume logic
            const p = profile as any;
            setProfileType(p.profile_type as ProfileType);
            
            // Map existing data
            setFormData(prev => ({
              ...prev,
              full_name: p.full_name || "",
              email: p.email || user.email || "",
              mobile_number: p.mobile_number || (user as any)?.mobile_number || "",
              company_name: p.company_name || "",
              contact_person_name: p.contact_person_name || "",
              business_type: p.business_type || "",
              target_buyer_type: p.target_buyer_type || "",
              category_items: p.category_items || [],
              address: p.address_text || p.address || "",
              city: p.city || "",
              country: p.country || "",
              pincode: p.pincode || "",
              google_map_link: p.google_map_link || "",
            }));

            // Logic to determine which step to resume from
            if (!p.profile_type) setCurrentStep(1);
            else if (!p.full_name && !p.company_name) setCurrentStep(2);
            else if (!p.business_type) setCurrentStep(3);
            else setCurrentStep(4);
          }
        } catch (err) {
          console.error("Error initializing profile:", err);
        }
      }
    }
    initProfile();
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!profileType) {
        newErrors.profileType = "Please select a profile type";
      }
    } else if (currentStep === 2) {
      if (profileType === "Individual") {
        if (!formData.full_name) newErrors.full_name = "Full Name is required";
      } else {
        if (!formData.company_name) newErrors.company_name = "Company Name is required";
      }
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.mobile_number) newErrors.mobile_number = "Mobile Number is required";
    } else if (currentStep === 3) {
      if (!formData.business_type) newErrors.business_type = "Business Type is required";
      if (formData.category_items.length === 0) newErrors.category_items = "At least one category is required";
    } else if (currentStep === 4) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.pincode) newErrors.pincode = "Pincode is required";
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
      let data: any = {};
      if (step === 1) {
        data = { profile_type: profileType };
      } else if (step === 2) {
        if (profileType === "Individual") {
          data = {
            full_name: formData.full_name,
            email: formData.email,
            mobile_number: formData.mobile_number,
          };
        } else {
          data = {
            company_name: formData.company_name,
            contact_person_name: formData.contact_person_name,
            email: formData.email,
            mobile_number: formData.mobile_number,
          };
        }
      } else if (step === 3) {
        data = {
          business_type: formData.business_type,
          target_buyer_type: profileType === "Individual" ? "" : formData.target_buyer_type,
          category_items: formData.category_items,
        };
      } else if (step === 4) {
        data = {
          address_text: formData.address,
          city: formData.city,
          country: formData.country,
          pincode: formData.pincode,
          google_map_link: formData.google_map_link,
        };
      }

      const result = await completeProfileStep(step, data);

      if (step < 4) {
        setCurrentStep(step + 1);
      } else {
        // Refresh the workspaces list to include the newly created profile
        await refreshWorkspaces();
        
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

  const addCategory = () => {
    if (!currentCategory.category) return;
    
    // Add any pending input as a subcategory
    let subs = [...currentCategory.sub_categories];
    if (subCategoryInput.trim()) {
        subs.push(subCategoryInput.trim());
    }

    setFormData(prev => ({
      ...prev,
      category_items: [...prev.category_items, { ...currentCategory, sub_categories: subs }]
    }));
    setCurrentCategory({ category: "", sub_categories: [], description: "" });
    setSubCategoryInput("");
    if (errors.category_items) setErrors(p => ({ ...p, category_items: "" }));
  };

  const addSubQuery = () => {
      if (!subCategoryInput.trim()) return;
      if (!currentCategory.sub_categories.includes(subCategoryInput.trim())) {
          setCurrentCategory(prev => ({
              ...prev,
              sub_categories: [...prev.sub_categories, subCategoryInput.trim()]
          }));
      }
      setSubCategoryInput("");
  };

  const removeSubCategory = (sub: string) => {
      setCurrentCategory(prev => ({
          ...prev,
          sub_categories: prev.sub_categories.filter(s => s !== sub)
      }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      category_items: prev.category_items.filter((_, i) => i !== index)
    }));
  };

  const ProfileTypeCard = ({ type, title, icon, description }: { type: ProfileType, title: string, icon: string, description: string }) => (
    <div 
      onClick={() => setProfileType(type)}
      className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer group ${
        profileType === type 
          ? "border-blue-600 bg-blue-50/50 shadow-md" 
          : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
        profileType === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
      }`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-1 ${profileType === type ? "text-blue-900" : "text-gray-800"}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
      {profileType === type && (
        <div className="absolute top-4 right-4 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center mb-2">
          <Image src="/images/logo.png" alt="Logo" width={48} height={48} className="object-contain mr-3" />
          <div className="flex flex-col">
            <span className="text-2xl tracking-tight text-[#1e293b] leading-none mb-1">
              <span className="font-normal">LET'S</span> <span className="font-bold">B2B</span>
            </span>
            <span className="text-[10px] tracking-[0.4em] text-blue-600 font-bold uppercase ml-0.5">Global</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium">Build your professional B2B identity</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep === 1 && "Choose Profile Type"}
            {currentStep === 2 && "Identity Details"}
            {currentStep === 3 && "Business Classification"}
            {currentStep === 4 && "Location & Launch"}
          </h2>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Step {currentStep} of 4
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= currentStep ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]" : "bg-gray-100"}`} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <ProfileTypeCard 
              type="Individual"
              title="Individual"
              icon="👤"
              description="For freelancers, solo consultants, and independent agents."
            />
            <ProfileTypeCard 
              type="Company"
              title="Company"
              icon="🏢"
              description="For registered firms, agencies, and large corporations."
            />
            <ProfileTypeCard 
              type="Association"
              title="Association"
              icon="🤝"
              description="For industry bodies, chambers, and non-profit groups."
            />
            {errors.profileType && <p className="text-red-500 text-xs font-bold mt-2 ml-1">⚠️ {errors.profileType}</p>}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {profileType === "Individual" ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.full_name ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.full_name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.full_name}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">{profileType} Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder={`Enter ${profileType?.toLowerCase()} name`}
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.company_name ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.company_name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.company_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    placeholder="Full name of contact person"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!!user?.email}
                  placeholder="contact@example.com"
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.email ? "border-red-500" : "border-gray-200"} ${user?.email ? "opacity-60 cursor-not-allowed text-gray-500" : ""}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  readOnly={!!(user as any)?.mobile_number}
                  placeholder="+1 234 567 890"
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.mobile_number ? "border-red-500" : "border-gray-200"} ${(user as any)?.mobile_number ? "opacity-60 cursor-not-allowed text-gray-500" : ""}`}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Business Type</label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.business_type ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select Business Type</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {profileType !== "Individual" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Target Buyer Type</label>
                  <select
                    name="target_buyer_type"
                    value={formData.target_buyer_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Buyer Type</option>
                    {TARGET_BUYER_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Business Categories</label>
                <button 
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  + Add New
                </button>
              </div>
              
              {formData.category_items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.category_items.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                      <span>{cat.category} {cat.sub_categories.length > 0 && `(${cat.sub_categories.join(', ')})`}</span>
                      <button onClick={() => removeCategory(i)} className="text-blue-400 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={() => setShowCategoryModal(true)}
                  className={`p-4 border-2 border-dashed rounded-xl cursor-pointer text-center group transition-colors ${errors.category_items ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/20"}`}
                >
                  <p className="text-sm text-gray-400 font-medium group-hover:text-blue-500">Add categories to describe your expertise</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Office Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full street address"
                rows={2}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.address ? "border-red-500" : "border-gray-200"}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.city ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.country ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pincode / ZIP</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.pincode ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Google Maps (Optional)</label>
                <input
                  type="url"
                  name="google_map_link"
                  value={formData.google_map_link}
                  onChange={handleInputChange}
                  placeholder="https://maps.google..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex gap-3 mt-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl shadow-sm">🚀</div>
              <div>
                <h4 className="text-sm font-bold text-green-900">Ready to go!</h4>
                <p className="text-xs text-green-700 leading-tight">Your profile will be activated immediately after finishing this step.</p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>⚠️</span> {submitError}
          </div>
        )}

        <div className="pt-4 space-y-3">
          <button
            onClick={() => submitStep()}
            disabled={isLoading}
            className="w-full py-4.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "PROCESSSING..." : currentStep === 4 ? "COMPLETE & LAUNCH 🚀" : "NEXT STEP →"}
          </button>
          
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isLoading}
              className="w-full py-2.5 text-gray-400 text-xs font-bold hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
            >
              ← GO BACK
            </button>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Business Category</h3>
                <p className="text-xs text-gray-500 font-medium">Select categories that match your services</p>
              </div>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category Title</label>
                <select
                  value={currentCategory.category}
                  onChange={(e) => setCurrentCategory({...currentCategory, category: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                >
                  <option value="">Select Category</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sub-Categories</label>
                
                {/* Visual Chips */}
                {currentCategory.sub_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {currentCategory.sub_categories.map((sub, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded flex items-center gap-1">
                                {sub}
                                <button onClick={() => removeSubCategory(sub)} className="hover:text-red-500">×</button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type & Press Enter..."
                      value={subCategoryInput}
                      onChange={(e) => setSubCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubQuery();
                          }
                      }}
                      className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    />
                    <button 
                        onClick={addSubQuery}
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                    >
                        +
                    </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description (Optional)</label>
                <textarea
                  placeholder="Briefly describe what you offer in this category..."
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium h-24 resize-none"
                />
              </div>
              
              <button 
                onClick={() => {
                  addCategory();
                  setShowCategoryModal(false);
                }}
                disabled={!currentCategory.category}
                className="w-full py-4 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-100 disabled:opacity-50 disabled:bg-gray-300 mt-2"
              >
                ADD CATEGORY
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
