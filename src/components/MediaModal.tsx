"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { uploadProfileMedia, ImageSection } from "@/lib/profile";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sections: ImageSection[]) => void;
  currentSections: ImageSection[];
}

export default function MediaModal({
  isOpen,
  onClose,
  onSave,
  currentSections,
}: MediaModalProps) {
  const [sections, setSections] = useState<ImageSection[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);

  // Sync with currentSections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSections([...currentSections]);
    }
  }, [isOpen, currentSections]);

  const handleAddSection = () => {
    const newSection: ImageSection = {
      Title: "",
      description: "",
      order: sections.length + 1,
      imageUrls: [],
    };
    setSections([...sections, newSection]);
    setActiveSectionIndex(sections.length);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    if (activeSectionIndex === index) setActiveSectionIndex(null);
  };

  const handleUpdateSection = (index: number, field: keyof ImageSection, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadRes = await uploadProfileMedia(files);
      // uploadRes is an array of objects with 'url' property
      const newUrls = uploadRes.map((res: any) => res.url);
      
      const newSections = [...sections];
      newSections[index] = {
        ...newSections[index],
        imageUrls: [...newSections[index].imageUrls, ...newUrls],
      };
      setSections(newSections);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (sectionIndex: number, imageIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].imageUrls = newSections[sectionIndex].imageUrls.filter(
      (_, i) => i !== imageIndex
    );
    setSections(newSections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Media Management</h2>
            <p className="text-sm text-gray-500 mt-1">Organize your gallery into sections with titles and descriptions</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Build your gallery</h3>
              <p className="text-gray-500 text-center max-w-sm mb-8">Create sections like 'Room Views', 'Amenities', or 'Recent Events' to showcase your business.</p>
              <button 
                onClick={handleAddSection}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200 active:scale-95 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Section
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {sections.map((section, idx) => (
                <div 
                  key={idx} 
                  className={`group relative border transition-all duration-300 rounded-2xl ${
                    activeSectionIndex === idx ? 'border-blue-500 shadow-xl shadow-blue-50 bg-white' : 'border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200'
                  }`}
                  onClick={() => setActiveSectionIndex(idx)}
                >
                  {/* Remove Section Button (Top Right Absolute) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveSection(idx); }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="p-6 space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <input 
                          type="text"
                          placeholder="Section Title (e.g. Luxury Suites)"
                          className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 font-bold text-lg text-gray-900 placeholder:text-gray-400 transition-all shadow-sm"
                          value={section.Title}
                          onChange={(e) => handleUpdateSection(idx, 'Title', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <textarea 
                          placeholder="Brief description of this section..."
                          className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 text-sm text-gray-600 placeholder:text-gray-400 resize-none h-auto min-h-[45px] transition-all shadow-sm"
                          rows={1}
                          value={section.description}
                          onChange={(e) => handleUpdateSection(idx, 'description', e.target.value)}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {section.imageUrls.map((url, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-square group/img rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                          <img src={url} alt={`Preview ${imgIdx}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx, imgIdx); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/img:opacity-100 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload Button */}
                      <label 
                        className={`aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group/upload relative bg-gray-50/50 ${
                          isUploading && activeSectionIndex === idx ? 'pointer-events-none' : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleImageUpload(idx, e)}
                        />
                        {isUploading && activeSectionIndex === idx ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-2" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover/upload:bg-blue-100 transition-colors border border-gray-100">
                              <svg className="w-6 h-6 text-gray-400 group-hover/upload:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Add Item</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={handleAddSection}
                className="w-full py-10 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 group/btn bg-white shadow-sm"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center group-hover/btn:bg-blue-100 transition-colors border border-gray-100">
                  <svg className="w-7 h-7 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-lg">Create Another Section</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-xs text-gray-400 font-medium">Changes will be saved to your public profile.</p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={() => onSave(sections)}
              disabled={isUploading || sections.length === 0}
              className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200 disabled:opacity-50 disabled:shadow-none translate-y-0 active:translate-y-0.5"
            >
              {isUploading ? 'System Busy...' : 'Save Gallery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
