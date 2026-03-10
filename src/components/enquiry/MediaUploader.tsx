"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, Video, FileText, X } from "lucide-react";
import Image from "next/image";

interface FileEntry {
  id: string;
  file: File;
  previewUrl: string;
  uploadProgress: number; // 0–100, 100 = done
}

const MediaUploader = () => {
  const { setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const binaryFiles: File[] = watch("binaryFiles") || [];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0kb";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return v + (i === 0 ? "b" : ["kb", "mb", "gb"][i - 1]);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newEntries: FileEntry[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "",
      uploadProgress: 0,
    }));
    const updatedEntries = [...fileEntries, ...newEntries];
    setFileEntries(updatedEntries);
    setValue(
      "binaryFiles",
      updatedEntries.map((e) => e.file),
    );

    // Simulate upload progress for new files
    newEntries.forEach((entry) => {
      const duration = 600;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
        setFileEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, uploadProgress: progress } : e,
          ),
        );
        if (progress < 100) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    const entry = fileEntries.find((e) => e.id === id);
    if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    const updatedEntries = fileEntries.filter((f) => f.id !== id);
    setFileEntries(updatedEntries);
    setValue(
      "binaryFiles",
      updatedEntries.map((e) => e.file),
    );
  };

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={20} />;
    if (type.startsWith("video/")) return <Video size={20} />;
    return <FileText size={20} />;
  };

  useEffect(() => {
    return () => {
      fileEntries.forEach((e) => {
        if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      });
    };
  }, [fileEntries]);

  // Clear local state when form is reset externally (e.g. after successful submit)
  useEffect(() => {
    if ((!binaryFiles || binaryFiles.length === 0) && fileEntries.length > 0) {
      fileEntries.forEach((e) => {
        if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
      });
      setFileEntries([]);
    }
  }, [binaryFiles]);

  return (
    <section>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Drag and Drop Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex-1 min-h-[200px] border-2 border-dashed bg-white rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            isDragging
              ? "border-[#6B3FA0]/50 bg-purple-50/30"
              : "border-gray-200 hover:border-[#6B3FA0]/30"
          }`}
        >
          <div className="">
            <Image
              src="/assets/images/upload-image.svg"
              alt="Upload"
              width={62}
              height={56}
              className="object-contain"
            />
          </div>
          <p className="text-[16px] text-[#434343] text-center">
            Drop your image here, or Browse
          </p>
          <p className="text-[13px] text-[#434343]">
            Support : PNG, JPG, JPEG, WEBP
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
          />
        </div>

        {/* Right: File List */}
        <div className="flex flex-col gap-3 lg:w-[280px] shrink-0">
          {fileEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-2 duration-300"
            >
              <div className="w-12 h-9 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                {entry.previewUrl ? (
                  <img
                    src={entry.previewUrl}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="text-[#6B3FA0]">
                    {getIcon(entry.file.type)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate">
                  {entry.file.name}
                </p>
                {entry.uploadProgress < 100 ? (
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${entry.uploadProgress}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {formatSize(entry.file.size)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(entry.id);
                }}
                className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 shrink-0"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaUploader;
