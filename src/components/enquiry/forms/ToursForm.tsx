"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Calendar, ChevronDown, Users, Minus, Plus } from "lucide-react";

type DetailsErrors = {
  tourType?: { message?: string };
  tourFormat?: { message?: string };
  city?: { message?: string };
  country?: { message?: string };
};

const inputBase =
  "w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 transition-all placeholder:text-gray-400";

const selectBase =
  "w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 appearance-none cursor-pointer transition-all";

function NumberStepper({
  name,
  label,
  min = 0,
  max = 99,
  defaultValue = 0,
  icon: Icon,
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <div className="flex items-center gap-2 h-11 px-3 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon size={18} className="text-gray-400 shrink-0" />
            <span className="text-[13px] font-medium text-gray-600 truncate">
              {label}
            </span>
          </div>
          <div className="flex items-center shrink-0 gap-0">
            <button
              type="button"
              onClick={() =>
                field.onChange(Math.max(min, (field.value ?? defaultValue) - 1))
              }
              className="w-7 h-7 flex items-center justify-center text-gray-600 bg-[#EFEFEF] hover:bg-gray-300 rounded-lg transition-colors"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="w-9 text-center text-[13px] font-medium text-gray-700">
              {field.value ?? defaultValue}
            </span>
            <button
              type="button"
              onClick={() =>
                field.onChange(Math.min(max, (field.value ?? defaultValue) + 1))
              }
              className="w-7 h-7 flex items-center justify-center text-gray-600 bg-[#EFEFEF] hover:bg-gray-300 rounded-lg transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    />
  );
}

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
        {/* Tour Type */}
        <div className="relative">
          <select {...register("details.tourType")} className={selectBase}>
            <option value="">Tour Type</option>
            <option value="cultural">Cultural</option>
            <option value="adventure">Adventure</option>
            <option value="educational">Educational</option>
            <option value="luxury">Luxury</option>
            <option value="pilgrimage">Pilgrimage</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).tourType && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Tour type is required
            </p>
          )}
        </div>

        {/* Tour Format */}
        <div className="relative">
          <select {...register("details.tourFormat")} className={selectBase}>
            <option value="">Tour Format</option>
            <option value="group">Fixed Group</option>
            <option value="private">Private (FIT)</option>
            <option value="custom">Customizable</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).tourFormat && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Tour format is required
            </p>
          )}
        </div>

        {/* Purpose of Travel */}
        <div className="relative">
          <select
            {...register("details.purposeOfTravel")}
            className={selectBase}
          >
            <option value="">Purpose of Travel</option>
            <option value="leisure">Leisure</option>
            <option value="business">Business</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="family">Family</option>
            <option value="pilgrimage">Pilgrimage</option>
            <option value="adventure">Adventure</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* City */}
        <div className="relative">
          <select {...register("details.city")} className={selectBase}>
            <option value="">City</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Goa">Goa</option>
            <option value="Kerala">Kerala</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).city && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              City is required
            </p>
          )}
        </div>

        {/* Region */}
        <div className="relative">
          <select {...register("details.region")} className={selectBase}>
            <option value="">Region</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
            <option value="North East">North East</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Country */}
        <div className="relative">
          <select {...register("details.country")} className={selectBase}>
            <option value="">Country</option>
            <option value="India">India</option>
            <option value="Nepal">Nepal</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Bhutan">Bhutan</option>
            <option value="Maldives">Maldives</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).country && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Country is required
            </p>
          )}
        </div>

        {/* Check In */}
        <div className="relative">
          <Controller
            name="details.checkIn"
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
                    {field.value ? field.value : "Check in"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
          />
        </div>

        {/* Check Out */}
        <div className="relative">
          <Controller
            name="details.checkOut"
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
                    {field.value ? field.value : "Check out"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
          />
        </div>

        {/* Flexible */}
        <div className="relative">
          <Controller
            name="details.flexible"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <select
                ref={field.ref}
                value={
                  field.value === true
                    ? "yes"
                    : field.value === false
                      ? "no"
                      : ""
                }
                onChange={(e) => field.onChange(e.target.value === "yes")}
                onBlur={field.onBlur}
                className={selectBase}
              >
                <option value="">Flexible</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            )}
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Adults */}
        <NumberStepper
          name="details.adults"
          label="Adults"
          min={1}
          max={50}
          defaultValue={1}
          icon={Users}
        />

        {/* Children (0y-10y) */}
        <NumberStepper
          name="details.children"
          label="Children (0y-10y)"
          min={0}
          max={20}
          defaultValue={0}
          icon={Users}
        />

        {/* Property Type */}
        <div className="relative">
          <select {...register("details.propertyType")} className={selectBase}>
            <option value="">Property Type</option>
            <option value="hotel">Hotel</option>
            <option value="resort">Resort</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="homestay">Homestay</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Star Category */}
        <div className="relative">
          <select {...register("details.starCategory")} className={selectBase}>
            <option value="">Star Category</option>
            <option value="5star">5 Star</option>
            <option value="4star">4 Star</option>
            <option value="3star">3 Star</option>
            <option value="2star">2 Star</option>
            <option value="budget">Budget</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Room Category */}
        <div className="relative">
          <select {...register("details.roomCategory")} className={selectBase}>
            <option value="">Room Category</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="villa">Villa</option>
            <option value="family">Family</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Inclusions Group */}
        <div className="md:col-span-full mt-2">
          <label className="block text-[15px] font-medium text-[#006DCB]  mb-2 border-b border-gray-50 pb-2">
            Inclusions Required
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {INCLUSIONS.map((incl) => (
              <label
                key={incl}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={incl}
                  {...register("details.inclusions")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {incl}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences Group */}
        <div className="md:col-span-full mt-2">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2 border-b border-gray-50 pb-2">
            Preferences
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {PREFERENCES.map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={pref}
                  {...register("details.preferences")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="md:text-[16px] text-[14px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {pref}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToursForm;
