"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";

type DetailsErrors = {
  serviceType?: { message?: string };
  treatmentCategory?: { message?: string };
};

const inputBase =
  "w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 transition-all placeholder:text-gray-400";

const selectBase =
  "w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 appearance-none cursor-pointer transition-all";

const ADDITIONAL_SERVICES = [
  "Airport Transfers",
  "Interpreter",
  "Medical Visa Assistance",
  "Post Care Tourism",
];

const TIMELINE_OPTIONS = ["Immediate", "Planned", "Consultation"];

const MedicalTourismForm = () => {
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
            <option value="surgery">Surgery</option>
            <option value="dental">Dental</option>
            <option value="wellness">Wellness / Rejuvenation</option>
            <option value="consultation">Medical Consultation</option>
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

        {/* Treatment Category */}
        <div className="relative">
          <select
            {...register("details.treatmentCategory")}
            className={selectBase}
          >
            <option value="">Treatment Category</option>
            <option value="cardiology">Cardiology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="oncology">Oncology</option>
            <option value="neurology">Neurology</option>
            <option value="cosmetic">Cosmetic / Plastic Surgery</option>
            <option value="fertility">Fertility / IVF</option>
            <option value="general">General Medicine</option>
            <option value="other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {errors.details &&
            (errors.details as DetailsErrors).treatmentCategory && (
              <p className="text-red-500 text-[10px] mt-1 font-bold italic">
                Treatment category is required
              </p>
            )}
        </div>

        {/* City */}
        <div className="relative">
          <select {...register("details.city")} className={selectBase}>
            <option value="">City</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kochi">Kochi</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* State */}
        <div className="relative">
          <select {...register("details.state")} className={selectBase}>
            <option value="">State</option>
            <option value="Kerala">Kerala</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Telangana">Telangana</option>
            <option value="Other">Other</option>
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
            <option value="UAE">UAE</option>
            <option value="Turkey">Turkey</option>
            <option value="Thailand">Thailand</option>
            <option value="Singapore">Singapore</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* No. of Patients */}
        <div className="relative">
          <Controller
            name="details.patients"
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
                <option value="">No. of Patients</option>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
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

        {/* Attendants */}
        <div className="relative">
          <Controller
            name="details.attendants"
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
                <option value="">Attendants</option>
                {[0, 1, 2, 3, 4, 5].map((n) => (
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

        {/* Hospital Preference */}
        <div className="relative">
          <select
            {...register("details.hospitalPreference")}
            className={selectBase}
          >
            <option value="">Hospital Preference</option>
            <option value="any">Any Accredited Hospital</option>
            <option value="government">Government Hospital</option>
            <option value="private">Private Hospital</option>
            <option value="specific">Specific Hospital</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Accommodation Type */}
        <div className="relative">
          <select
            {...register("details.accommodationType")}
            className={selectBase}
          >
            <option value="">Accommodation Type</option>
            <option value="hotel">Hotel</option>
            <option value="hospital_attached">Hospital Attached</option>
            <option value="apartment">Service Apartment</option>
            <option value="guest_house">Guest House</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Length of Stay - next to Accommodation Type */}
        <div className="relative md:col-start-2">
          <select
            {...register("details.lengthOfStay")}
            className={selectBase}
          >
            <option value="">Length of Stay</option>
            <option value="3-5 days">3 - 5 days</option>
            <option value="1-2 weeks">1 - 2 weeks</option>
            <option value="2-4 weeks">2 - 4 weeks</option>
            <option value="1-3 months">1 - 3 months</option>
            <option value="more_than_3_months">More than 3 months</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Additional Services */}
        <div className="md:col-span-full mt-4">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2 border-b border-gray-50 pb-2">
            Additional Services Required
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {ADDITIONAL_SERVICES.map((service) => (
              <label
                key={service}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={service}
                  {...register("details.additionalServices")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="text-[16px] font-medium text-[#000000] group-hover:text-gray-900 transition-colors">
                  {service}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="md:col-span-full mt-6 pt-4 border-t border-gray-100">
          <label className="block text-[15px] font-medium text-[#006DCB] mb-2">
            Timeline
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
            {TIMELINE_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={option.toLowerCase()}
                  {...register("details.timeline")}
                  className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
                />
                <span className="text-[16px] font-medium text-[#000000]">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalTourismForm;
