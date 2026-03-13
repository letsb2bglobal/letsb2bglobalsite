import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProfileItem {
  documentId: string;
  title: string;
  description?: string;
  image_url?: string;
  order: number;
  extra_data?: Record<string, any>;
  status?: 'active' | 'inactive';
  custom_title?: string | null;
  details?: string | null;
}

export interface ProfileSection {
  documentId: string;
  section_key: string;
  category: string;
  order: number;
  data?: Record<string, any>;
  profile_items: ProfileItem[];
}

// ── Category / Section Config ──────────────────────────────────────────────

export type CategoryKey = 'travel_trade' | 'transport_provider' | 'experience_provider' | 'institution';

export interface SectionConfig {
  key: string;
  label: string;
  order: number;
}

export const CATEGORY_SECTIONS: Record<CategoryKey, SectionConfig[]> = {
  travel_trade: [
    { key: 'services',             label: 'Services Offered',     order: 1 },
    { key: 'destinations',         label: 'Destinations',          order: 2 },
    { key: 'product_portfolio',    label: 'Product Portfolio',     order: 3 },
    { key: 'operational_strength', label: 'Operational Strength',  order: 4 },
    { key: 'trade_terms',          label: 'Trade Terms',           order: 5 },
  ],
  transport_provider: [
    { key: 'transport_services',   label: 'Transport Services',    order: 1 },
    { key: 'fleet',                label: 'Fleet Details',         order: 2 },
    { key: 'operational_coverage', label: 'Operational Coverage',  order: 3 },
    { key: 'driver_safety',        label: 'Driver & Safety',       order: 4 },
  ],
  experience_provider: [
    { key: 'experiences',          label: 'Experiences Offered',   order: 1 },
    { key: 'packages',             label: 'Packages',              order: 2 },
    { key: 'locations',            label: 'Locations Covered',     order: 3 },
  ],
  institution: [
    { key: 'destination_overview',    label: 'Destination Overview',  order: 1 },
    { key: 'tourism_products',        label: 'Tourism Products',      order: 2 },
    { key: 'trade_support',           label: 'Trade Support',         order: 3 },
    { key: 'tourism_infrastructure',  label: 'Infrastructure',        order: 4 },
  ],
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  travel_trade:        'Travel Trade',
  transport_provider:  'Transport Provider',
  experience_provider: 'Experience Provider',
  institution:         'Institution / Tourism Board',
};

// ── Section APIs ───────────────────────────────────────────────────────────

/**
 * GET /api/profile-sections/profile/:profileId
 * Returns all sections (with nested profile_items) for the given profile documentId.
 */
export const getProfileSections = async (profileId: string): Promise<ProfileSection[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/api/profile-sections/profile/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
};

/**
 * POST /api/profile-sections/profile/:profileId
 * Upserts a section (creates if not exists, updates if it does).
 */
export const upsertProfileSection = async (
  profileId: string,
  payload: { section_key: string; category: CategoryKey; order: number; data?: Record<string, any> }
): Promise<ProfileSection | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/profile-sections/profile/${profileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

/**
 * DELETE /api/profile-sections/:sectionDocumentId
 * Deletes a section and all its items (cascades on backend).
 */
export const deleteProfileSection = async (sectionDocumentId: string): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/api/profile-sections/${sectionDocumentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * PUT /api/profile-sections/:sectionId
 * Updates meta-data like order or data using the Section's ID.
 */
export const updateProfileSection = async (
  sectionId: string,
  payload: { order?: number; data?: Record<string, any> }
): Promise<ProfileSection | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/profile-sections/${sectionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

// ── Item APIs ──────────────────────────────────────────────────────────────

/**
 * POST /api/profile-items/section/:sectionDocumentId
 * Creates a profile item. Sends multipart/form-data:
 *   - image  (File, optional)
 *   - data   (JSON string with title/description/order/extra_data)
 */
export const createProfileItem = async (
  sectionDocumentId: string,
  payload: { title: string; description?: string; order?: number; extra_data?: Record<string, any> },
  imageFile?: File | null
): Promise<ProfileItem | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    let res: Response;

    if (imageFile) {
      // multipart/form-data when image is present
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('data', JSON.stringify(payload));
      res = await fetch(`${API_URL}/api/profile-items/section/${sectionDocumentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } else {
      // plain JSON when no image
      res = await fetch(`${API_URL}/api/profile-items/section/${sectionDocumentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

/**
 * PUT /api/profile-items/:itemDocumentId
 * Updates text fields of an item (title, description, order, extra_data).
 */
export const updateProfileItem = async (
  itemDocumentId: string,
  payload: { title?: string; description?: string; order?: number; extra_data?: Record<string, any> }
): Promise<ProfileItem | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/profile-items/${itemDocumentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
};

/**
 * POST /api/profile-items/:itemDocumentId/image
 * Uploads or replaces the image for an existing item.
 * Field name must be "image".
 */
export const uploadProfileItemImage = async (
  itemDocumentId: string,
  file: File
): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;
  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/profile-items/${itemDocumentId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.image_url || json.data?.image_url || null;
  } catch {
    return null;
  }
};

/**
 * DELETE /api/profile-items/:itemDocumentId
 * Deletes a profile item.
 */
export const deleteProfileItem = async (itemDocumentId: string): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/api/profile-items/${itemDocumentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * POST /api/profile-items/section/:sectionId/batch
 * Updates many items at once. Automatically Creates, Updates, and Deletes.
 */
export const batchSyncProfileItems = async (
  sectionId: string,
  items: Array<{ documentId?: string; title: string; description?: string; order: number; extra_data?: Record<string, any> }>
): Promise<{ success: boolean; data: ProfileItem[] }> => {
  const token = getToken();
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_URL}/api/profile-items/section/${sectionId}/batch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return { success: false, data: [] };
    const json = await res.json();
    return { success: true, data: json.data || [] };
  } catch {
    return { success: false, data: [] };
  }
};
