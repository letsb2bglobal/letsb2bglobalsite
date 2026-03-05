/**
 * Geo-based currency display: show USD for traffic from US (and similar)
 * and INR for India. Prices are stored in INR; we convert for display only.
 */

// Approximate INR → USD for display. Update periodically or fetch from an API.
const INR_TO_USD = 1 / 83;

/** Map ISO country code to display currency */
export function countryToCurrency(country: string | null): "USD" | "INR" {
  if (!country) return "INR";
  const u = country.toUpperCase();
  // US, Canada, UK (often expect USD or equivalent), and a few others
  if (["US", "USA", "CA", "GB", "UK", "AU", "NZ", "SG"].includes(u)) return "USD";
  return "INR";
}

/** Convert INR amount to USD for display (rounded) */
export function inrToUsd(amountInr: number): number {
  return Math.round(amountInr * INR_TO_USD);
}

/** Format a price stored in INR for display in the given currency */
export function formatPrice(amountInr: number, currency: "USD" | "INR"): string {
  if (currency === "USD") {
    const usd = inrToUsd(amountInr);
    return usd === 0 ? "$0" : `$${usd.toLocaleString()}`;
  }
  return amountInr === 0 ? "₹0" : `₹${Number(amountInr).toLocaleString("en-IN")}`;
}

/** Currency symbol only */
export function currencySymbol(currency: "USD" | "INR"): string {
  return currency === "USD" ? "$" : "₹";
}
