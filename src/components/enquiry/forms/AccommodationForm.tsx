"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

const PREFERENCES = [
  "Air Conditioned",
  "Non AC",
  "Balcony",
  "Jacuzzi",
  "Private Pool",
  "Cottage",
  "Pet Friendly",
  "Senior Citizen Friendly",
  "Differently Abled Friendly",
];

const AccommodationForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Property Type */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Property Type
        </label>
        <select
          {...register("details.propertyType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Property Type</option>
          <option value="hotel">Hotel</option>
          <option value="resort">Resort</option>
          <option value="villa">Villa</option>
          <option value="apartment">Apartment</option>
          <option value="homestay">Homestay</option>
        </select>
        {errors.details?.propertyType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Property type is required
          </p>
        )}
      </div>

      {/* Destination */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Destination
        </label>
        <input
          {...register("details.destination")}
          placeholder="e.g. Munnar, Kerala"
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        />
        {errors.details?.destination && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Destination is required
          </p>
        )}
      </div>

      {/* Check In / Out */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Check In
        </label>
        <input
          type="date"
          {...register("details.checkIn")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] tracking-tighter"
        />
      </div>
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Check Out
        </label>
        <input
          type="date"
          {...register("details.checkOut")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] tracking-tighter"
        />
      </div>

      {/* Guests & Groups */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Adults
          </label>
          <input
            type="number"
            {...register("details.adults", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Children
          </label>
          <input
            type="number"
            {...register("details.children", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Rooms
          </label>
          <input
            type="number"
            {...register("details.rooms", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Star Cat
          </label>
          <select
            {...register("details.starCategory")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          >
            <option value="">Any</option>
            <option value="5star">5 Star</option>
            <option value="4star">4 Star</option>
            <option value="3star">3 Star</option>
            <option value="budget">Budget</option>
          </select>
        </div>
      </div>

      {/* Preferences checkboxes */}
      <div className="col-span-full mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
          Special Preferences
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

export default AccommodationForm;
