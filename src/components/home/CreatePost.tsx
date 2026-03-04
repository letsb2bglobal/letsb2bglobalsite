"use client";

import React, { useState } from 'react';
import { Bed, Map, Car, Users, HeartPulse, Send } from 'lucide-react';
import PostCreationModal from '../enquiry/PostCreationModal';
import { getUser } from '@/lib/auth';
import { EnquiryType } from '@/lib/validations/enquiry';

const CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: Bed, color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-200 hover:bg-blue-50/50' },
  { id: 'tours', label: 'Tours', icon: Map, color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-200 hover:bg-purple-50/50' },
  { id: 'transportation', label: 'Transportation', icon: Car, color: 'bg-orange-50 text-orange-600', hover: 'hover:border-orange-200 hover:bg-orange-50/50' },
  { id: 'mice', label: 'MICE', icon: Users, color: 'bg-green-50 text-green-600', hover: 'hover:border-green-200 hover:bg-green-50/50' },
  { id: 'medical_tourism', label: 'Medical Tourism', icon: HeartPulse, color: 'bg-red-50 text-red-600', hover: 'hover:border-red-200 hover:bg-red-50/50' },
] as const;

const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EnquiryType>('accommodation');
  const user = getUser();

  const handleOpenModal = (type: EnquiryType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#6B3FA0] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-100">
               {user?.username?.substring(0, 1).toUpperCase() || 'U'}
             </div>
             <div>
               <h3 className="text-[15px] font-black text-gray-900 leading-none mb-1 uppercase tracking-tighter">
                 Create New Enquiry
               </h3>
               <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
                 Post to 25,000+ verified partners
               </p>
             </div>
          </div>
          <button 
            onClick={() => handleOpenModal('accommodation')}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#f6f2f8] text-[#6B3FA0] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6B3FA0] hover:text-white transition-all group"
          >
            <span>Write A Post</span>
            <Send size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          Select Enquiry Category
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleOpenModal(cat.id as EnquiryType)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-white transition-all transform active:scale-95 group ${cat.hover}`}
            >
              <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <cat.icon size={24} strokeWidth={2.5} />
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
