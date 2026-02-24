'use client';

import React, { useState, useEffect } from 'react';
import { fetchCategories, type ApiCategory } from '@/lib/categories';

interface CategorySelectProps {
  /** Controlled value — should be the category **name** string (e.g. "Travel Agency") */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** When true the select renders disabled with a loading indicator */
  disabled?: boolean;
  /** Optional extra class applied to the wrapper div */
  wrapperClassName?: string;
  /** Pass `required` to the underlying <select> */
  required?: boolean;
  id?: string;
}

/**
 * Reusable category <select> that fetches from /api/categories.
 *
 * - Auto-fetches on mount with a 5-minute in-memory cache.
 * - Falls back to the 8 seeded categories if the API is unavailable.
 * - `value` / `onChange` use the category **name** string (display value),
 *   NOT the documentId slug, so it matches what the TradeWall expects.
 */
export default function CategorySelect({
  value,
  onChange,
  placeholder = 'Select business type...',
  className,
  disabled,
  wrapperClassName,
  required,
  id,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((cats) => {
      if (!cancelled) {
        setCategories(cats);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const baseClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className={wrapperClassName}>
      <select
        id={id}
        required={required}
        disabled={disabled || loading}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? baseClass}
      >
        <option value="">
          {loading ? 'Loading categories...' : placeholder}
        </option>
        {categories.map((cat) => (
          // value = cat.name (display string, not slug/documentId)
          // This matches: TradeWall feed scoring, user-profile category_items[].category
          <option key={cat.documentId} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
