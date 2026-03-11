// "use client";

// import React, { useState } from "react";
// import { useFormContext, Controller } from "react-hook-form";
// import { ChevronDown, X } from "lucide-react";

// const TagsInput = () => {
//   const { control } = useFormContext();
//   const [inputValue, setInputValue] = useState("");

//   return (
//     <Controller
//       name="tags"
//       control={control}
//       // defaultValue={[]}
//       render={({ field: { value: tags = [], onChange } }) => {
//         const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//           if (e.key === "Enter" && inputValue.trim()) {
//             e.preventDefault();
//             const newTag = inputValue.trim().replace(/^#/, "");
//             if (!tags.includes(newTag)) {
//               onChange([...tags, newTag]);
//             }
//             setInputValue("");
//           }
//         };

//         const removeTag = (tagToRemove: string) => {
//           onChange(tags.filter((t: string) => t !== tagToRemove));
//         };

//         return (
//           <div>
//             {/* Input field at top */}
//             <div className="relative mb-3 w-full">
//               <input
//                 type="text"
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Add Tags"
//                 className="w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 placeholder:text-gray-400 transition-all"
//               />

//               {/* <ChevronDown
//                 size={16}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//               /> */}
//             </div>

//             {/* Tags displayed below as pills */}
//             <div className="flex flex-wrap gap-2">
//               {tags.map((tag: string) => (
//                 <span
//                   key={tag}
//                   className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium group"
//                 >
//                   <span>#{tag}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeTag(tag)}
//                     className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
//                     aria-label={`Remove ${tag}`}
//                   >
//                     <X size={12} strokeWidth={2.5} />
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>
//         );
//       }}
//     />
//   );
// };

// export default TagsInput;


"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";

const TagsInput = () => {
  const { watch, setValue } = useFormContext();
  const tags: string[] = watch("tags") || [];

  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();

      const newTag = inputValue.trim().replace(/^#/, "");

      if (!tags.includes(newTag)) {
        setValue("tags", [...tags, newTag]);
      }

      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div>
      {/* Input */}
      <div className="relative mb-3 w-full">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add Tags"
          className="w-full h-11 px-4 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]/30 outline-none font-medium text-[13px] text-gray-800 placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium"
          >
            #{tag}

            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-500"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
