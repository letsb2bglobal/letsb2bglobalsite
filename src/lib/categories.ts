/**
 * Category API helpers
 * Endpoint: GET /api/categories?filters[active][$eq]=true&sort=order:asc
 * Public — no auth required
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export interface ApiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
}

/**
 * Fallback list used when the API is unreachable.
 * These names match the backend seed exactly.
 */
export const FALLBACK_CATEGORIES: ApiCategory[] = [
  { id: 1, documentId: 'travel-agency',           name: 'Travel Agency',               slug: 'travel-agency',           active: true, order: 1 },
  { id: 2, documentId: 'tour-operator',            name: 'Tour Operator',               slug: 'tour-operator',           active: true, order: 2 },
  { id: 3, documentId: 'dmc',                      name: 'DMC',                         slug: 'dmc',                     active: true, order: 3 },
  { id: 4, documentId: 'hotel-resort-stay',        name: 'Hotel / Resort / Stay',       slug: 'hotel-resort-stay',       active: true, order: 4 },
  { id: 5, documentId: 'transport-provider',       name: 'Transport Provider',          slug: 'transport-provider',      active: true, order: 5 },
  { id: 6, documentId: 'event-mice-company',       name: 'Event / MICE Company',        slug: 'event-mice-company',      active: true, order: 6 },
  { id: 7, documentId: 'wellness-medical-tourism', name: 'Wellness / Medical Tourism',  slug: 'wellness-medical-tourism',active: true, order: 7 },
  { id: 8, documentId: 'travel-tech-company',      name: 'Travel Tech Company',         slug: 'travel-tech-company',     active: true, order: 8 },
];

// Simple in-memory cache across the session so we don't hammer the API
let _cache: ApiCategory[] | null = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch active categories from the API.
 * Returns cached data if fresh, falls back to FALLBACK_CATEGORIES on error.
 */
export async function fetchCategories(): Promise<ApiCategory[]> {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;

  try {
    const res = await fetch(
      `${API_URL}/api/categories?filters[active][$eq]=true&sort=order:asc`,
      { cache: 'no-store' }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const data: ApiCategory[] = json?.data ?? [];

    if (data.length > 0) {
      _cache = data;
      _cacheAt = now;
      return data;
    }

    // API returned empty — use fallback (don't cache empty result)
    return FALLBACK_CATEGORIES;
  } catch (err) {
    console.warn('[categories] API unavailable, using fallback:', err);
    return FALLBACK_CATEGORIES;
  }
}
