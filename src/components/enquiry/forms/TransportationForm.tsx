"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Calendar, ChevronDown } from "lucide-react";

type DetailsErrors = {
  serviceType?: { message?: string };
  vehicleType?: { message?: string };
  dateTime?: { message?: string };
  location?: { message?: string };
};

const inputBase =
  "w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 transition-all placeholder:text-gray-400";

const selectBase =
  "w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 appearance-none cursor-pointer transition-all";

const SPECIAL_INSTRUCTIONS = [
  "Language-Speaking Driver",
  "Seat Belt",
  "Child Seat",
  "Wheelchair Friendly",
  "Luggage Carrier",
  "Mini Fridge / Drinking Water",
  "Mini Fridge",
  "Drinking Water",
  "Mic Speaker",
  "Audio Video",
  "VIP Service",
];

const TransportationForm = () => {
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
        {/* Service Type */}
        <div className="relative">
          <select {...register("details.serviceType")} className={selectBase}>
            <option value="">Service Type</option>
            <option value="airport_transfer">Airport Transfer</option>
            <option value="intercity">Intercity</option>
            <option value="full_day">Full Day Usage</option>
            <option value="disposal">Disposal</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).serviceType && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Service type is required
            </p>
          )}
        </div>

        {/* Vehicle Type */}
        <div className="relative">
          <select {...register("details.vehicleType")} className={selectBase}>
            <option value="">Vehicle Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luxury Car</option>
            <option value="minibus">Minibus / Tempo</option>
            <option value="bus">Coach / Bus</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).vehicleType && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Vehicle type is required
            </p>
          )}
        </div>

        {/* No. of Passengers */}
        <div className="relative">
          <Controller
            name="details.passengers"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <select
                {...field}
                value={
                  field.value === undefined || field.value === null
                    ? ""
                    : field.value
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value, 10),
                  )
                }
                className={selectBase}
              >
                <option value="">No. of Passengers</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 30, 50].map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
            )}
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Luggage */}
        <div className="relative">
          <Controller
            name="details.luggage"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <select
                {...field}
                value={
                  field.value === undefined || field.value === null
                    ? ""
                    : field.value
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value, 10),
                  )
                }
                className={selectBase}
              >
                <option value="">Luggage</option>
                {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <select {...register("details.location")} className={selectBase}>
            <option value="">Location</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Goa">Goa</option>
            <option value="Kerala">Kerala</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).location && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Location is required
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div className="relative">
          <Controller
            name="details.dateTime"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 h-11 px-4 bg-white border border-gray-200 rounded-xl">
                <Calendar size={18} className="text-gray-400 shrink-0" />
                <div className="relative flex-1 min-w-0">
                  <input
                    type="datetime-local"
                    {...field}
                    value={field.value ?? ""}
                    className="w-full border-0 bg-transparent p-0 text-[13px] font-medium text-transparent caret-transparent outline-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center text-[13px] font-medium text-gray-800">
                    {field.value
                      ? new Date(field.value).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "Date & Time"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
          />
          {errors.details && (errors.details as DetailsErrors).dateTime && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Date & Time is required
            </p>
          )}
        </div>

        {/* Usage Details */}
        <div className="relative">
          <select {...register("details.usageDetails")} className={selectBase}>
            <option value="">Usage Details</option>
            <option value="one_way">One Way</option>
            <option value="round_trip">Round Trip</option>
            <option value="hourly">Hourly</option>
            <option value="full_day">Full Day</option>
            <option value="multi_day">Multi Day</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Purpose */}
        <div className="relative">
          <select {...register("details.purpose")} className={selectBase}>
            <option value="">Purpose</option>
            <option value="business">Business</option>
            <option value="leisure">Leisure</option>
            <option value="wedding">Wedding</option>
            <option value="event">Event</option>
            <option value="airport_transfer">Airport Transfer</option>
            <option value="sightseeing">Sightseeing</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Special Requirements */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2 border-b border-gray-50 pb-2">
            Special Requirements
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {SPECIAL_INSTRUCTIONS.map((instr) => (
              <label
                key={instr}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={instr}
                  {...register("details.specialInstructions")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] truncate font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {instr}
                </span>
              </label>
            ))}
          </div>

          {/* Budget - Per Day / Per Transfer (below Special Instructions) */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <label className="block text-[15px] font-medium text-[#006DCB] mb-2">
              Budget
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value="perDay"
                  {...register("budget.budgetType")}
                  className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
                />
                <span className="text-[14px] font-bold text-gray-800 group-hover:text-gray-900">
                  Per Day
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value="perTransfer"
                  {...register("budget.budgetType")}
                  className="w-4 h-4 rounded-full border-2 border-gray-300 text-[#6B3FA0] focus:ring-[#6B3FA0] checked:bg-[#6B3FA0]"
                />
                <span className="text-[14px] font-medium text-gray-800 group-hover:text-gray-900">
                  Per Transfer
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationForm;
