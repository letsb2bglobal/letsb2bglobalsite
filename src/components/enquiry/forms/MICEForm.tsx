"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Calendar, ChevronDown } from "lucide-react";

type DetailsErrors = {
  eventType?: { message?: string };
  venueLocation?: { message?: string };
  startDate?: { message?: string };
  endDate?: { message?: string };
};

const inputBase =
  "w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 transition-all placeholder:text-gray-400";

const selectBase =
  "w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 appearance-none cursor-pointer transition-all";

const VENUE_REQUIREMENTS = [
  "Main Hall",
  "Breakout Rooms",
  "Gala Dinner Area",
];

const TECHNICAL_REQUIREMENTS = ["AV", "Stage", "Gala Dinner Area"];

const FOOD_AND_BEVERAGE = ["Tea Breaks", "Meals", "Theme Dinner"];

const DECISION_STATUS = ["Immediate", "Shortlisted", "Tentative"];

const MICEForm = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-5">
      {/* Description - full width */}
      <div>
        <textarea
          {...register("description")}
          placeholder="Description"
          rows={4}
          className={`${inputBase} resize-y min-h-[100px] py-3`}
        />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Event Type */}
        <div className="relative">
          <select {...register("details.eventType")} className={selectBase}>
            <option value="">Event Type</option>
            <option value="conference">Conference</option>
            <option value="incentive">Incentive Trip</option>
            <option value="exhibition">Exhibition</option>
            <option value="wedding">Destination Wedding</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).eventType && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Event type is required
            </p>
          )}
        </div>

        {/* City / Resort / Convention Centre */}
        <div className="relative">
          <select {...register("details.venueLocation")} className={selectBase}>
            <option value="">City / Resort / Convention Centre</option>
            <option value="Dubai, UAE">Dubai, UAE</option>
            <option value="Singapore">Singapore</option>
            <option value="Goa, India">Goa, India</option>
            <option value="Rajasthan, India">Rajasthan, India</option>
            <option value="Kerala, India">Kerala, India</option>
            <option value="Bangkok, Thailand">Bangkok, Thailand</option>
            <option value="Mumbai, India">Mumbai, India</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).venueLocation && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Venue location is required
            </p>
          )}
        </div>

        {/* Start Date */}
        <div className="relative">
          <Controller
            name="details.startDate"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 h-11 px-4 bg-white border border-gray-200 rounded-xl">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <div className="relative flex-1 min-w-0">
                  <input
                    type="date"
                    {...field}
                    value={field.value ?? ""}
                    className="w-full border-0 bg-transparent p-0 text-[13px] font-medium text-transparent caret-transparent outline-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center text-[13px] font-medium text-gray-800">
                    {field.value ? field.value : "Start Date"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
          />
          {errors.details && (errors.details as DetailsErrors).startDate && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Start date is required
            </p>
          )}
        </div>

        {/* End Date */}
        <div className="relative">
          <Controller
            name="details.endDate"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 h-11 px-4 bg-white border border-gray-200 rounded-xl">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <div className="relative flex-1 min-w-0">
                  <input
                    type="date"
                    {...field}
                    value={field.value ?? ""}
                    className="w-full border-0 bg-transparent p-0 text-[13px] font-medium text-transparent caret-transparent outline-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center text-[13px] font-medium text-gray-800">
                    {field.value ? field.value : "End Date"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
          />
          {errors.details && (errors.details as DetailsErrors).endDate && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              End date is required
            </p>
          )}
        </div>

        {/* No. of Participants */}
        <div className="relative md:col-span-2">
          <Controller
            name="details.participants"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <select
                {...field}
                value={field.value === undefined || field.value === null ? "" : field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value, 10)
                  )
                }
                className={selectBase}
              >
                <option value="">No. of Participants</option>
                {[10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500].map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  )
                )}
              </select>
            )}
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Venue Requirements */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2 border-b border-gray-50 pb-2">
            Venue Requirements
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {VENUE_REQUIREMENTS.map((req) => (
              <label
                key={req}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={req}
                  {...register("details.venueRequirements")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {req}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Accommodation Required */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2">
            Accommodation Required
          </label>
          <div className="flex flex-wrap gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="yes"
                {...register("details.accommodationRequired")}
                className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
              />
              <span className="text-[14px] font-medium text-gray-800">
                Yes
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="no"
                {...register("details.accommodationRequired")}
                className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
              />
              <span className="text-[14px] font-medium text-gray-800">
                No
              </span>
            </label>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <select
                {...register("details.accommodationRooms")}
                className={selectBase}
              >
                <option value="">Rooms</option>
                {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="relative">
              <select
                {...register("details.accommodationNights")}
                className={selectBase}
              >
                <option value="">Nights</option>
                {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Technical Support */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-3 border-b border-gray-50 pb-2">
            Technical Support
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {TECHNICAL_REQUIREMENTS.map((req) => (
              <label
                key={req}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={req}
                  {...register("details.technicalRequirements")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {req}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Food & Beverage */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-3 border-b border-gray-50 pb-2">
            Food & Beverage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {FOOD_AND_BEVERAGE.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={item}
                  {...register("details.foodAndBeverage")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Decision Status */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2">
            Decision Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {DECISION_STATUS.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={status.toLowerCase()}
                  {...register("details.decisionStatus")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget - Per Delegate / Total Event */}
        <div className="md:col-span-full mt-6 pt-4 border-t border-gray-100">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2">
            Budget
          </label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="perDelegate"
                {...register("budget.budgetType")}
                className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
              />
              <span className="md:text-[16px] text-[14px] font-medium text-gray-800">
                Per Delegate
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="totalEvent"
                {...register("budget.budgetType")}
                className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
              />
              <span className="md:text-[16px] text-[14px] font-medium text-gray-800">
                Total Event
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MICEForm;
