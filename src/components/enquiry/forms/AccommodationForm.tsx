"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Calendar,
  ChevronDown,
  Users,
  User,
  Building2,
  Minus,
  Plus,
} from "lucide-react";

type DetailsErrors = {
  propertyType?: { message?: string };
  destination?: { message?: string };
};

const PREFERENCES = [
  "Air Conditioned",
  "Non AC",
  "Balcony",
  "Jacuzzi",
  "Private Pool",
  "Cottage",
  "High Privacy",
  "Pet Friendly",
  "Senior Citizen Friendly",
  "Differently Abled Friendly",
];

const inputBase =
  "w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 transition-all placeholder:text-gray-400";

const selectBase =
  "w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 appearance-none cursor-pointer transition-all";

function NumberStepper({
  name,
  label,
  min = 0,
  max = 99,
  defaultValue = 1,
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

const AccommodationForm = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-5 ">
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
          {errors.details && (errors.details as DetailsErrors).propertyType && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Property type is required
            </p>
          )}
        </div>

        {/* Destination */}
        <div className="relative">
          <select {...register("details.destination")} className={selectBase}>
            <option value="">Destination</option>
            <option value="Munnar, Kerala">Munnar, Kerala</option>
            <option value="Goa">Goa</option>
            <option value="Kerala">Kerala</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="Kashmir">Kashmir</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details && (errors.details as DetailsErrors).destination && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Destination is required
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
                    className="w-full border-0 bg-transparent p-0 text-[13px] font-medium text-transparent caret-transparent outline-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center text-[13px] font-medium text-gray-800">
                    {field.value ? field.value : "Check In"}
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
                    className="w-full border-0 bg-transparent p-0 text-[13px] font-medium text-transparent caret-transparent outline-none"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center text-[13px] font-medium text-gray-800">
                    {field.value ? field.value : "Check Out"}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>
            )}
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

        {/* Children */}
        <NumberStepper
          name="details.children"
          label="Children"
          min={0}
          max={20}
          defaultValue={0}
          icon={User}
        />

        {/* No of Rooms */}
        <NumberStepper
          name="details.rooms"
          label="No of Rooms"
          min={1}
          max={20}
          defaultValue={1}
          icon={Building2}
        />

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

        {/* Extra Beds */}
        <div className="relative">
          <Controller
            name="details.extraBeds"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10),
                  )
                }
                className={selectBase}
              >
                <option value="">Extra Beds</option>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            )}
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Child Without Bed */}
        <NumberStepper
          name="details.childWithoutBed"
          label="Child Without Bed"
          min={0}
          max={10}
          defaultValue={0}
          icon={User}
        />

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

        {/* Meal Plan */}
        <div className="relative">
          <select {...register("details.mealPlan")} className={selectBase}>
            <option value="">Meal Plan</option>
            <option value="Room Only">Room Only</option>
            <option value="Bed & Breakfast">Bed & Breakfast</option>
            <option value="Half Board">Half Board</option>
            <option value="Full Board">Full Board</option>
            <option value="All Inclusive">All Inclusive</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Special Preferences */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-[15px] font-medium text-[#006DCB] mb-3">
          Special Preferences
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
              <span className="md:text-[16px] text-[14px] font-medium text-[#000000] truncate">
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
