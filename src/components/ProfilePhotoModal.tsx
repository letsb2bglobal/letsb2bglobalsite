"use client";

import React, { useState, useRef, useEffect } from "react";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string | null;
  companyName?: string;
  onViewPhoto: () => void;
  onUploadPhoto: (file: File) => void;
  onDeletePhoto: () => void;
  uploading?: boolean;
}

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  companyName = "Profile",
  onViewPhoto,
  onUploadPhoto,
  onDeletePhoto,
  uploading = false,
}: ProfilePhotoModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL when component unmounts or when image changes
  useEffect(() => {
    return () => {
      if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSelectedImagePreview(previewUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleViewPhoto = () => {
    setIsViewingPhoto(true);
  };

  const handleClosePhotoView = () => {
    setIsViewingPhoto(false);
  };

  const handleDeletePhoto = () => {
    // Clear local state first
    setSelectedImageFile(null);
    if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImagePreview(null);
    
    // Then call parent handler to delete the actual photo
    onDeletePhoto();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {!isViewingPhoto ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Profile Photo</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Photo Preview */}
            <div className="p-6 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-gray-50">
                  {selectedImagePreview ? (
                    <img
                      src={selectedImagePreview}
                      alt={`${companyName} preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : currentPhotoUrl ? (
                    <img
                      src={currentPhotoUrl}
                      alt={companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <span className="text-blue-500 font-bold text-3xl">
                        {companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 space-y-3">
              {/* View Photo Button */}
              <button
                onClick={handleViewPhoto}
                disabled={!selectedImagePreview && !currentPhotoUrl}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Photo
              </button>

              {/* Upload Photo Button */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Photo
                </button>
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50 rounded-xl">
                    <p className="text-blue-600 font-semibold">Drop image here</p>
                  </div>
                )}
              </div>

              {/* Delete Photo Button */}
              <button
                onClick={handleDeletePhoto}
                disabled={!currentPhotoUrl && !selectedImageFile}
                className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Photo
              </button>
            </div>
          </>
        ) : (
          /* Photo View Mode */
          <div className="relative">
            {/* Close button for photo view */}
            <button
              onClick={handleClosePhotoView}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Large photo preview */}
            <div className="flex items-center justify-center p-8 bg-gray-50 min-h-[400px]">
              <img
                src={selectedImagePreview || currentPhotoUrl || ''}
                alt={`${companyName} full view`}
                className="max-w-full max-h-[350px] rounded-lg shadow-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
