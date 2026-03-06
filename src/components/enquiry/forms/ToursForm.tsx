"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

type DetailsErrors = { tourType?: { message?: string }; tourFormat?: { message?: string } };

const INCLUSIONS = [
  "Accommodation",
  "Transportation",
  "Sightseeing",
  "Guide",
  "Entry Tickets",
  "Experiences",
];

const PREFERENCES = [
  "Luxury",
  "Premium",
  "Economy",
  "Privacy",
  "Pet Friendly",
  "Wellness",
  "Adventure",
  "Leisure",
];

const ToursForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tour Type */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Tour Type
        </label>
        <select
          {...register("details.tourType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Tour Type</option>
          <option value="cultural">Cultural</option>
          <option value="adventure">Adventure</option>
          <option value="educational">Educational</option>
          <option value="luxury">Luxury</option>
          <option value="pilgrimage">Pilgrimage</option>
        </select>
        {errors.details && (errors.details as DetailsErrors).tourType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Tour type is required
          </p>
        )}
      </div>

      {/* Tour Format */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Tour Format
        </label>
        <select
          {...register("details.tourFormat")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Format</option>
          <option value="group">Fixed Group</option>
          <option value="private">Private (FIT)</option>
          <option value="custom">Customizable</option>
        </select>
        {errors.details && (errors.details as DetailsErrors).tourFormat && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Tour format is required
          </p>
        )}
      </div>

      {/* Origin & Destination */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            City
          </label>
          <input
            {...register("details.city")}
            placeholder="Origin City"
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Country
          </label>
          <input
            {...register("details.country")}
            placeholder="Destination"
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Start Date
          </label>
          <input
            type="date"
            {...register("details.checkIn")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            End Date
          </label>
          <input
            type="date"
            {...register("details.checkOut")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Inclusions Group */}
      <div className="md:col-span-full mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
          Trip Inclusions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
          {INCLUSIONS.map((incl) => (
            <label key={incl} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                value={incl}
                {...register("details.inclusions")}
                className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
              />
              <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                {incl}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferences Group */}
      <div className="md:col-span-full mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
          Tour Preferences
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
          {PREFERENCES.map((pref) => (
            <label key={pref} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                value={pref}
                {...register("details.preferences")}
                className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
              />
              <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                {pref}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToursForm;
