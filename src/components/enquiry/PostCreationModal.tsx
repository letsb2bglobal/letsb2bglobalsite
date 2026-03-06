"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronDown, Send } from "lucide-react";
import axios from "axios";
import { 
  MasterEnquirySchema, 
  MasterEnquiryForm, 
  EnquiryType,
  EnquiryTypeEnum
} from "@/lib/validations/enquiry";

// Components
import EnquiryTypeSelector from "./EnquiryTypeSelector";
import AccommodationForm from "./forms/AccommodationForm";
import ToursForm from "./forms/ToursForm";
import TransportationForm from "./forms/TransportationForm";
import MICEForm from "./forms/MICEForm";
import MedicalTourismForm from "./forms/MedicalTourismForm";
import MediaUploader from "./MediaUploader";
import ExternalLinksInput from "./ExternalLinksInput";
import TagsInput from "./TagsInput";
import BudgetSelector from "./BudgetSelector";
import { getUser, getToken } from "@/lib/auth";
import { useTeam } from "@/context/TeamContext";

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: EnquiryType;
}

const PostCreationModal: React.FC<PostCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = "accommodation",
}) => {
  const [activeType, setActiveType] = useState<EnquiryType>(initialType);

  useEffect(() => {
    if (isOpen && initialType) {
      setActiveType(initialType);
    }
  }, [isOpen, initialType]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getUser();
  const { activeWorkspace } = useTeam();

  const methods = useForm<MasterEnquiryForm>({
    resolver: zodResolver(MasterEnquirySchema) as any,
    defaultValues: {
      type: "accommodation",
      title: "",
      details: {},
      budget: {
        amount: 0,
        currency: "INR",
        budgetType: "perPerson",
      },
      tags: [],
      attachments: [],
      externalLinks: [],
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  // Sync activeType with form state
  useEffect(() => {
    if (activeType) {
      setValue("type", activeType);
      // Reset details when changing type to ensure clean state
      setValue("details", {});
    }
  }, [activeType, setValue]);

  const onSubmit = async (data: MasterEnquiryForm) => {
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
      const token = getToken();
      
      const componentMap: Record<string, string> = {
        accommodation: "enquiry.accommodation",
        tours: "enquiry.tour",
        transportation: "enquiry.transportation",
        mice: "enquiry.mice",
        medical_tourism: "enquiry.medical",
      };

      const postData = {
        title: data.title,
        type: data.type,
        description: data.title,
        destination: data.details.destination || data.details.city || data.details.venueLocation || "",
        enquiry_details: [
          {
            __component: componentMap[data.type] || `enquiry.${data.type}`,
            ...data.details
          }
        ],
        budget: {
          amount: data.budget.amount,
          currency: data.budget.currency,
          budgetType: data.budget.budgetType
        },
        tags: data.tags,
        user_profile: activeWorkspace?.data?.documentId,
        status: "Open",
        publishedAt: new Date().toISOString(),
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(postData));

      // Append binary files if any
      if (data.binaryFiles && data.binaryFiles.length > 0) {
        data.binaryFiles.forEach((file: File) => {
          formData.append("files.media_items", file);
        });
      }

      const response = await axios.post(`${apiUrl}/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (response.status === 200 || response.status === 201) {
        reset();
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveForm = () => {
    switch (activeType) {
      case "accommodation":
        return <AccommodationForm />;
      case "tours":
        return <ToursForm />;
      case "transportation":
        return <TransportationForm />;
      case "mice":
        return <MICEForm />;
      case "medical_tourism":
        return <MedicalTourismForm />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-[900px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B3FA0] to-[#8E54D7] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-200">
              {user?.username?.substring(0, 1).toUpperCase() || "L"}
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-black text-gray-900 leading-none mb-1.5 uppercase tracking-tighter">
                {user?.username || "Le Tourister"}
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all border border-gray-100 group">
                <span className="text-[10px] font-black text-[#6B3FA0] uppercase tracking-widest">Post to Anyone</span>
                <ChevronDown size={12} className="text-[#6B3FA0] group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-[#f6f2f8] rounded-xl border border-[#6B3FA0]/10">
              <span className="text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em]">
                {activeType.replace("_", " ")}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          <FormProvider {...methods}>
            <form id="enquiry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Type Selector */}
              <section>
                <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-4">
                  Select Enquiry Category
                </label>
                <EnquiryTypeSelector 
                  selected={activeType} 
                  onChange={setActiveType} 
                />
              </section>

              {/* Basic Title */}
              <section>
                <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-4">
                  Detailed Title
                </label>
                <input 
                  {...methods.register("title")}
                  placeholder="e.g. Seeking 5-Star Resort for Family Group in Munnar"
                  className="w-full h-14 px-5 bg-[#F7F7FB] border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#6B3FA0]/10 outline-none font-bold text-base transition-all placeholder:text-gray-300 shadow-sm"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-2 font-bold italic pr-2">{errors.title.message}</p>
                )}
              </section>

              {/* Dynamic Specific Form */}
              <section className="bg-white rounded-3xl p-6 border border-gray-50 shadow-sm">
                <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-4">
                   Enquiry Specific Parameters
                </label>
                {renderActiveForm()}
              </section>

              {/* Additional Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExternalLinksInput />
                <TagsInput />
              </div>

              <MediaUploader />
              
              <BudgetSelector />

            </form>
          </FormProvider>
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 text-gray-400 hover:text-gray-900 font-black text-sm uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            form="enquiry-form"
            disabled={isSubmitting}
            className="min-w-[180px] h-14 bg-[#6B3FA0] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>Submit Enquiry</span>
                <Send size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </footer>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PostCreationModal;
