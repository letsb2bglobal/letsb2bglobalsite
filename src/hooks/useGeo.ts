"use client";

import { useState, useEffect } from "react";
import { countryToCurrency } from "@/lib/currency";

export type DisplayCurrency = "USD" | "INR";

export function useGeo(): { country: string | null; currency: DisplayCurrency; loading: boolean } {
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        setCountry(data.country ?? null);
      })
      .catch(() => setCountry(null))
      .finally(() => setLoading(false));
  }, []);

  const currency = countryToCurrency(country);
  return { country, currency, loading };
}
