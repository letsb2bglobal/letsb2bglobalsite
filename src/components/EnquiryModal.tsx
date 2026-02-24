'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type UserProfile } from '@/lib/profile';
import { useAuth } from '@/components/ProtectedRoute';
import { useToast } from '@/components/Toast';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: UserProfile;
}

export default function EnquiryModal({ isOpen, onClose, targetProfile }: EnquiryModalProps) {
  const router = useRouter();
  const user = useAuth();
  const { showToast } = useToast();
  const [inquiryForm, setInquiryForm] = useState({
    title: '',
    description: '',
    destination: targetProfile.city || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !targetProfile?.userId) {
      showToast("Please login to send an enquiry", "error");
      return;
    }

    setSubmitting(true);

    try {
      const { startEnquiry } = await import("@/lib/enquiry");
      
      const messageBody = `Requirement: ${inquiryForm.title}\nDestination: ${inquiryForm.destination}\n\n${inquiryForm.description}`;
      
      await startEnquiry(targetProfile.documentId, inquiryForm.title, messageBody);

      showToast("Enquiry sent successfully!");
      onClose();
      // Optionally redirect to messages to see the conversation
      router.push("/messages");
    } catch (error: any) {
      console.error("Enquiry error:", error);
      showToast(error.message || "An error occurred. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
               {targetProfile.company_name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Send Enquiry</h2>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">To: {targetProfile.company_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={submitting}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSendInquiry} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Requirement Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Hotel rooms in Dubai"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
              value={inquiryForm.title}
              onChange={(e) => setInquiryForm({...inquiryForm, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Destination</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Dubai"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
              value={inquiryForm.destination}
              onChange={(e) => setInquiryForm({...inquiryForm, destination: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description / Message</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell them what you need..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm resize-none"
              value={inquiryForm.description}
              onChange={(e) => setInquiryForm({...inquiryForm, description: e.target.value})}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 font-bold text-sm bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Send Enquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
