"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

const BUDGET_TYPES = [
  { value: "perRoom", label: "Per Room per Night" },
  { value: "perPerson", label: "Per Person" },
  { value: "perDay", label: "Per Day" },
  { value: "perTransfer", label: "Per Transfer" },
  { value: "perDelegate", label: "Per Delegate" },
  { value: "totalEvent", label: "Total Event Budget" },
  { value: "treatmentStay", label: "Treatment & Stay Total" },
];

const CURRENCIES = ["INR", "USD", "EUR"];

const BudgetSelector = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-[#F7F7FB] rounded-2xl p-6 border border-gray-100">
      <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-4">
        Budget Section
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Currency */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Currency
          </label>
          <select
            {...register("budget.currency")}
            className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Budget Amount
          </label>
          <div className="relative">
             <input
              type="number"
              {...register("budget.amount", { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
             />
          </div>
          {(errors.budget as any)?.amount && (
            <p className="text-red-500 text-[10px] mt-1 font-bold italic">
              Budget is required
            </p>
          )}
        </div>

        {/* Type */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Budget Type
          </label>
          <select
            {...register("budget.budgetType")}
            className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
          >
            {BUDGET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 mt-3 font-medium italic">
        * Provide an indicative budget to get more accurate responses from partners.
      </p>
    </div>
  );
};

export default BudgetSelector;
