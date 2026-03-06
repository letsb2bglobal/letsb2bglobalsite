"use client";

import React, { useState } from "react";
import Image from "next/image";
import PostCreationModal from "../enquiry/PostCreationModal";
import { getUser } from "@/lib/auth";
import { EnquiryType } from "@/lib/validations/enquiry";

const CATEGORIES = [
  {
    id: "accommodation",
    label: "Accommodation",
    iconSrc: "/assets/icons/accommodation.png",
    color: "bg-blue-50 text-blue-600",
    hover: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  {
    id: "tours",
    label: "Tours",
    iconSrc: "/assets/icons/tours.png",
    color: "bg-purple-50 text-purple-600",
    hover: "hover:border-purple-200 hover:bg-purple-50/50",
  },
  {
    id: "transportation",
    label: "Transportation",
    iconSrc: "/assets/icons/transportation.png",
    color: "bg-orange-50 text-orange-600",
    hover: "hover:border-orange-200 hover:bg-orange-50/50",
  },
  {
    id: "mice",
    label: "MICE",
    iconSrc: "/assets/icons/mice.png",
    color: "bg-green-50 text-green-600",
    hover: "hover:border-green-200 hover:bg-green-50/50",
  },
  {
    id: "medical_tourism",
    label: "Medical Tourism",
    iconSrc: "/assets/icons/medical_tourism.png",
    color: "bg-red-50 text-red-600",
    hover: "hover:border-red-200 hover:bg-red-50/50",
  },
] as const;

const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] =
    useState<EnquiryType>("accommodation");
  const user = getUser();

  const handleOpenModal = (type: EnquiryType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-2 border border-gray-100">
        <label className="block text-[16px] font-medium text-[#000000] mb-4">
          Post new Enquiry
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleOpenModal(cat.id as EnquiryType)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl shadow-sm border shadow-gray-100 border-gray-100 bg-white transition-all transform active:scale-95 group ${cat.hover}`}
            >
              <div
                className={`flex items-center justify-center mb-3 overflow-hidden`}
              >
                <Image
                  src={cat.iconSrc}
                  alt={cat.label}
                  width={55}
                  height={45}
                  className="object-contain "
                />
              </div>
              <span className="text-[11px] font-black text-gray-700 tracking-tight text-center leading-tight">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <PostCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={selectedType}
        onSuccess={() => {
          console.log("Enquiry posted!");
        }}
      />
    </>
  );
};

export default CreatePost;
