"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

type DetailsErrors = { serviceType?: { message?: string }; treatmentCategory?: { message?: string } };

const ADDITIONAL_SERVICES = [
  "Airport Transfers",
  "Interpreter",
  "Medical Visa Assistance",
  "Post Care Tourism",
];

const TIMELINE = [
  "Immediate",
  "Planned",
  "Consultation",
];

const MedicalTourismForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Service & Treatment */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Service Type
        </label>
        <select
          {...register("details.serviceType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        >
          <option value="">Select Service</option>
          <option value="surgery">Surgery</option>
          <option value="dental">Dental</option>
          <option value="wellness">Wellness / Rejuvenation</option>
          <option value="consultation">Medical Consultation</option>
        </select>
        {errors.details && (errors.details as DetailsErrors).serviceType && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Service type is required
          </p>
        )}
      </div>

      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Treatment Category
        </label>
        <input
          {...register("details.treatmentCategory")}
          placeholder="e.g. Cardiology, Orthopedics"
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
        />
        {errors.details && (errors.details as DetailsErrors).treatmentCategory && (
          <p className="text-red-500 text-[10px] mt-1 font-bold italic">
            Treatment category is required
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
            placeholder="City"
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Country
          </label>
          <input
            {...register("details.country")}
            placeholder="Country"
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Patients & Attendants */}
      <div className="col-span-1 grid grid-cols-2 gap-3">
         <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Patients
          </label>
          <input
            type="number"
            {...register("details.patients", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Attendants
          </label>
          <input
            type="number"
            {...register("details.attendants", { valueAsNumber: true })}
            className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
          />
        </div>
      </div>

      {/* Accom & timeline */}
      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Accommodation Preference
        </label>
        <select
          {...register("details.accommodationType")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
        >
          <option value="">Select Type</option>
          <option value="hotel">Hotel</option>
          <option value="hospital_attached">Hospital Attached</option>
          <option value="apartment">Service Apartment</option>
        </select>
      </div>

      <div className="col-span-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          Timeline
        </label>
        <select
          {...register("details.timeline")}
          className="w-full h-11 px-4 bg-[#F7F7FB] border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px]"
        >
          <option value="">Timeline</option>
          {TIMELINE.map(t => (
            <option key={t} value={t.toLowerCase()}>{t}</option>
          ))}
        </select>
      </div>

      {/* Choice Group */}
      <div className="md:col-span-full mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">
          Additional Services Required
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
          {ADDITIONAL_SERVICES.map((service) => (
            <label key={service} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                value={service}
                {...register("details.additionalServices")}
                className="w-4 h-4 rounded border-gray-200 text-[#6B3FA0] focus:ring-[#6B3FA0]"
              />
              <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalTourismForm;
