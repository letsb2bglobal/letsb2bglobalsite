"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";

const CURRENCIES = [
  { value: "INR", symbol: "₹" },
  { value: "USD", symbol: "$" },
  { value: "EUR", symbol: "€" },
];

const BudgetSelector = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const currency = watch("budget.currency") || "INR";
  const currentCurrency =
    CURRENCIES.find((c) => c.value === currency) || CURRENCIES[0];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Budget input with currency selector inline */}
        <div className="flex h-11 md:w-[360px] bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#6B3FA0]/20 focus-within:border-[#6B3FA0]/30 transition-all">
          <Controller
            name="budget.amount"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                value={field.value === 0 || field.value === undefined ? "" : field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                }}
                placeholder="Budget Range"
                className="flex-1 min-w-0 h-full px-4 bg-transparent outline-none font-medium text-[13px] text-gray-800 placeholder:text-gray-400"
              />
            )}
          />
          <div className="relative flex items-center border-l border-gray-200 pl-2 pr-8 shrink-0 h-full min-w-[60px]">
            <select
              {...register("budget.currency")}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.value === "INR" ? "₹" : c.value === "USD" ? "$" : "€"}
                </option>
              ))}
            </select>
            <span className="font-medium text-[13px] text-gray-600 pointer-events-none">
              {currentCurrency.symbol}
            </span>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Budget type - required by schema, defaults from form */}
        <select
          {...register("budget.budgetType")}
          className="sr-only"
          aria-hidden
        >
          <option value="perRoom">Per Room per Night</option>
          <option value="perPerson">Per Person</option>
          <option value="perDay">Per Day</option>
          <option value="perTransfer">Per Transfer</option>
          <option value="perDelegate">Per Delegate</option>
          <option value="totalEvent">Total Event Budget</option>
          <option value="treatmentStay">Treatment & Stay Total</option>
        </select>

        {/* <select
  {...register("budget.budgetType")}
  className="h-11 px-3 border border-gray-200 rounded-xl bg-white text-[13px] text-gray-700"
>
  <option value="perRoom">Per Room per Night</option>
  <option value="perPerson">Per Person</option>
  <option value="perDay">Per Day</option>
  <option value="perTransfer">Per Transfer</option>
  <option value="perDelegate">Per Delegate</option>
  <option value="totalEvent">Total Event Budget</option>
  <option value="treatmentStay">Treatment & Stay Total</option>
</select> */}

        <p className="text-[11px] text-red-500 font-medium italic shrink-0">
          *per room per night
        </p>
      </div>

      {(errors.budget as { amount?: { message?: string } })?.amount && (
        <p className="text-red-500 text-[10px] mt-1 font-bold italic">
          Budget is required
        </p>
      )}
    </div>
  );
};

export default BudgetSelector;
