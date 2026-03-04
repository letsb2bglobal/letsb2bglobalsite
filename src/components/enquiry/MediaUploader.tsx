"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, X, FileText, Image as ImageIcon, Video, Link2 } from "lucide-react";

interface FileEntry {
  id: string; // Internal local ID
  file: File;
  previewUrl: string;
}

const MediaUploader = () => {
  const { setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  
  // Watch for external changes (like resets)
  const binaryFiles: File[] = watch("binaryFiles") || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newEntries: FileEntry[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));

    const updatedEntries = [...fileEntries, ...newEntries];
    setFileEntries(updatedEntries);
    setValue("binaryFiles", updatedEntries.map(e => e.file));
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    const entry = fileEntries.find(e => e.id === id);
    if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    
    const updatedEntries = fileEntries.filter((f) => f.id !== id);
    setFileEntries(updatedEntries);
    setValue("binaryFiles", updatedEntries.map(e => e.file));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={20} />;
    if (type.startsWith("video/")) return <Video size={20} />;
    return <FileText size={20} />;
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      fileEntries.forEach(e => {
        if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      });
    };
  }, [fileEntries]);

  return (
    <div className="bg-[#F7F7FB] rounded-2xl p-6 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em]">
          Media Attachments (Multiple)
        </label>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          {fileEntries.length} Files Selected
        </span>
      </div>

      {/* Upload Box */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer"
      >
        <div className="w-full h-32 border-2 border-dashed border-gray-200 group-hover:border-[#6B3FA0]/30 bg-white rounded-2xl flex flex-col items-center justify-center transition-all">
          <div className="w-12 h-12 bg-[#f6f2f8] rounded-xl flex items-center justify-center text-[#6B3FA0] mb-3 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <span className="text-[13px] font-bold text-gray-800 tracking-tight text-center px-4">
            Click to select or drag & drop images, videos, or documents
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide mt-1">
            PNG, JPG, MP4, PDF, DOCX (Max 10MB per file)
          </span>
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {fileEntries.map((entry) => (
          <div 
            key={entry.id} 
            className="relative flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group animate-in zoom-in duration-300 overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
               <div className="w-10 h-10 rounded-lg bg-[#f6f2f8] flex items-center justify-center text-[#6B3FA0] shrink-0 overflow-hidden">
                  {entry.previewUrl ? (
                    <img src={entry.previewUrl} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    getIcon(entry.file.type)
                  )}
               </div>
               <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold text-gray-800 truncate pr-2">
                    {entry.file.name}
                  </span>
                  <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">
                    {formatSize(entry.file.size)}
                  </span>
               </div>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(entry.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-10"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaUploader;
