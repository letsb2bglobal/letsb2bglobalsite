"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

const VENUE_REQUIREMENTS = [
  "Main Hall",
  "Breakout Rooms",
  "Gala Dinner Area",
];

const TECHNICAL_REQUIREMENTS = [
  "AV",
  "Stage",
];

const FOOD_AND_BEVERAGE = [
  "Tea Breaks",
  "Meals",
  "Theme Dinner",
];

const DECISION_STATUS = [
  "Immediate",
  "Shortlisted",
  "Tentative",
];

const MICEForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Event Type & Venue */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Event Type
        </label>
        <select
          {...register("details.eventType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Event Type</option>
          <option value="conference">Conference</option>
          <option value="incentive">Incentive Trip</option>
          <option value="exhibition">Exhibition</option>
          <option value="wedding">Destination Wedding</option>
        </select>
        {errors.details?.eventType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Event type is required
          </p>
        )}
      </div>

      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Venue Location
        </label>
        <input
          {...register("details.venueLocation")}
          placeholder="e.g. Dubai, UAE"
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
        />
        {errors.details?.venueLocation && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Venue location is required
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Start Date
          </label>
          <input
            type="date"
            {...register("details.startDate")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            End Date
          </label>
          <input
            type="date"
            {...register("details.endDate")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Participants & Decision status */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Participants
          </label>
          <input
            type="number"
            {...register("details.participants", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Decision Status
          </label>
          <select
            {...register("details.decisionStatus")}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          >
            <option value="">Status</option>
            {DECISION_STATUS.map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Choice Groups */}
      <div className="md:col-span-full mt-4 flex flex-col gap-6">
        {/* Venue Reqs */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
            Venue Requirements
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {VENUE_REQUIREMENTS.map((req) => (
              <label key={req} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  value={req}
                  {...register("details.venueRequirements")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                  {req}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Technical Reqs */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
            Technical Support
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {TECHNICAL_REQUIREMENTS.map((req) => (
              <label key={req} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  value={req}
                  {...register("details.technicalRequirements")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                  {req}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MICEForm;
