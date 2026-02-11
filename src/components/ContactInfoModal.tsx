"use client";

import React from "react";
import Image from "next/image";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function ContactInfoModal({ isOpen, onClose, profile }: ContactInfoModalProps) {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm border border-blue-100">
            📞
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h3>
            <p className="text-sm text-gray-500">Get in touch with {profile.company_name}</p>
          </div>

          <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {/* Mobile */}
            {profile.mobile_number && (
              <div className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Mobile Number</p>
                  <p className="text-gray-900 font-medium font-mono">{profile.mobile_number}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {profile.email && (
              <div className="flex items-start gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                  <p className="text-gray-900 font-medium break-all">{profile.email}</p>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                <div className="text-sm text-gray-700 space-y-1">
                 {profile.address_text && <p>{profile.address_text}</p>}
                 <p className="font-semibold">
                   {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                   {profile.pincode && ` - ${profile.pincode}`}
                 </p>
                </div>
                
                {profile.google_map_link && (
                  <a 
                    href={profile.google_map_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View on Google Maps ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
