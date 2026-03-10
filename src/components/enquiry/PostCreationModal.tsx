"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronDown } from "lucide-react";
import axios from "axios";
import {
  MasterEnquirySchema,
  MasterEnquiryForm,
  EnquiryType,
  EnquiryTypeEnum,
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
      description: "", 
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
      const token = getToken();

      const componentMap: Record<string, string> = {
        accommodation: "enquiry.accommodation",
        tours: "enquiry.tour",
        transportation: "enquiry.transportation",
        mice: "enquiry.mice",
        medical_tourism: "enquiry.medical",
      };

      // Backend expects extraBeds as string for accommodation
      const details =
        data.type === "accommodation" && data.details?.extraBeds !== undefined
          ? {
              ...data.details,
              extraBeds: String(
                data.details.extraBeds === "" ? "0" : data.details.extraBeds,
              ),
            }
          : data.details;

      const postData = {
        title: data.title,
        type: data.type,
    
        description: data.description,
        destination:
          data.details.destination ||
          data.details.city ||
          data.details.venueLocation ||
          "",
        enquiry_details: [
          {
            __component: componentMap[data.type] || `enquiry.${data.type}`,
            ...details,
          },
        ],
        budget: {
          amount: data.budget.amount,
          currency: data.budget.currency,
          budgetType: data.budget.budgetType,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-10 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-[768px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        {/* Header */}
        <header className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex gap-1.5 border border-[#D1D1D1] rounded-lg p-1.5 bg-[#F2F2F2] w-[241px]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#8E54D7] flex items-center justify-center text-white font-medium text-lg">
              {user?.username?.substring(0, 1).toUpperCase() || "L"}
            </div>
            <div className="flex flex-col">
              <h2 className="text-[20px] font-medium text-[#000000]">
                {user?.username || "Le Tourister"}
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-[14px] text-[#676767]">
                  Post To Anyone
                </span>
                <ChevronDown
                  size={12}
                  className="text-[#6B3FA0] group-hover:translate-y-0.5 transition-transform"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="">
              <span className="text-[16px] font-medium text-[#000000]">
                {activeType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <X size={15} strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          <FormProvider {...methods}>
            <form
              id="enquiry-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <MediaUploader />
              {/* Basic Title */}
              <section>
                <input
                  {...methods.register("title")}
                  placeholder="Title"
                  className="w-full h-12 px-4 border border-[#E5E5E5] rounded-lg text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6B3FA0] focus:border-[#6B3FA0]"
                />

                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.title.message}
                  </p>
                )}
              </section>

              {/* Dynamic Specific Form */}
              <section className="">{renderActiveForm()}</section>

              <BudgetSelector />

              {/* Additional Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* <ExternalLinksInput /> */}
                <TagsInput />
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-gray-200 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2 min-w-[120px] bg-[#b0b0b0] text-white rounded-sm font-bold text-sm uppercase tracking-wider shadow-sm hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="enquiry-form"
            disabled={isSubmitting}
            className="min-w-[120px] px-8 py-2 bg-[#6f2da8] text-white rounded-sm font-bold text-sm uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              "Submit"
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
