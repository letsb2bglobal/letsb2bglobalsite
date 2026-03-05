"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

type DetailsErrors = { serviceType?: { message?: string }; vehicleType?: { message?: string }; dateTime?: { message?: string } };

const SPECIAL_INSTRUCTIONS = [
  "Language Driver",
  "Seat Belt",
  "Child Seat",
  "Wheelchair Friendly",
  "Mini Fridge",
  "Drinking Water",
  "Audio Video",
  "VIP Service",
  "Mic Speaker",
];

const TransportationForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Service & Vehicle Type */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Service Type
        </label>
        <select
          {...register("details.serviceType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Service</option>
          <option value="airport_transfer">Airport Transfer</option>
          <option value="intercity">Intercity</option>
          <option value="full_day">Full Day Usage</option>
          <option value="disposal">Disposal</option>
        </select>
        {errors.details && (errors.details as DetailsErrors).serviceType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Service type is required
          </p>
        )}
      </div>

      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Vehicle Type
        </label>
        <select
          {...register("details.vehicleType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Vehicle</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="luxury">Luxury Car</option>
          <option value="minibus">Minibus / Tempo</option>
          <option value="bus">Coach / Bus</option>
        </select>
        {errors.details && (errors.details as DetailsErrors).vehicleType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Vehicle type is required
          </p>
        )}
      </div>

      {/* Passengers & Luggage */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Passengers
          </label>
          <input
            type="number"
            {...register("details.passengers", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Luggage
          </label>
          <input
            type="number"
            {...register("details.luggage", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          {...register("details.dateTime")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] tracking-tighter"
        />
        {errors.details && (errors.details as DetailsErrors).dateTime && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Date & Time is required
          </p>
        )}
      </div>

      {/* Location */}
      <div className="col-span-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Location
        </label>
        <input
          {...register("details.location")}
          placeholder="Pickup location or City"
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
        />
      </div>

      {/* Special Instructions Group */}
      <div className="md:col-span-full mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
          Special Requirements
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
          {SPECIAL_INSTRUCTIONS.map((instr) => (
            <label key={instr} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                value={instr}
                {...register("details.specialInstructions")}
                className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
              />
              <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                {instr}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransportationForm;
