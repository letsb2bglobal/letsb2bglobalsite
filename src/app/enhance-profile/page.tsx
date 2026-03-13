'use client';

import React, { useState, useEffect, useCallback, useRef, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ProtectedRoute';
import {
  saveFullProfile, deleteGalleryPhoto, GalleryImage, UserProfile,
  getMyProfile, getFullProfile, uploadProfileMedia
} from '@/lib/profile';
import {
  getProfileSections,
  upsertProfileSection,
  createProfileItem,
  updateProfileItem,
  deleteProfileItem,
  uploadProfileItemImage,
  batchSyncProfileItems,
  CATEGORY_SECTIONS,
  CATEGORY_LABELS,
  ProfileSection,
  ProfileItem,
  CategoryKey,
  SectionConfig,
} from '@/lib/profileSections';
import Header from '@/components/Header';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, Pencil, Trash2, X,
  ChevronDown, Upload, ImagePlus, Camera, Instagram, Globe, Linkedin,
  Facebook, Twitter, Youtube, User, Phone, Mail, MapPin, Building2,
  Sparkles,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAIN_CATEGORIES: { value: string; label: string }[] = [
  { value: 'travel_trade',        label: 'Travel Trade' },
  { value: 'transport_provider',  label: 'Transport Provider' },
  { value: 'experience_provider', label: 'Experience Provider' },
  { value: 'institution',         label: 'Institution / Tourism Board' },
];

const COUNTRIES = ['India', 'UAE', 'United Kingdom', 'United States', 'Singapore', 'Australia', 'Germany', 'France', 'Other'];
const INDIAN_STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Kerala', 'Goa', 'Other'];
const CITIES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Delhi: ['New Delhi', 'Noida', 'Gurugram'],
  Karnataka: ['Bengaluru', 'Mysuru'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur'],
  Goa: ['Panaji', 'Margao'],
  Kerala: ['Kochi', 'Thiruvananthapuram'],
  Gujarat: ['Ahmedabad', 'Surat'],
};

// ─── Section behaviour ────────────────────────────────────────────────────────

const TEXTAREA_SECTIONS = new Set(['trade_terms', 'driver_safety', 'trade_support', 'destination_overview']);
const METRICS_SECTIONS = new Set(['tourism_infrastructure', 'operational_strength']);
const TAG_SECTIONS = new Set(['services', 'transport_services', 'experiences']);
const IMAGE_SECTIONS = new Set(['destinations', 'product_portfolio', 'fleet', 'packages', 'locations', 'tourism_products', 'certifications', 'operational_coverage']);

const METRICS_FIELDS: Record<string, { key: string; label: string }[]> = {
  tourism_infrastructure: [
    { key: 'number_of_hotels', label: 'Hotels' },
    { key: 'number_of_international_airports', label: 'International Airports' },
    { key: 'number_of_major_attractions', label: 'Major Attractions' },
    { key: 'number_of_convention_centres', label: 'Convention Centres' },
    { key: 'number_of_national_parks', label: 'National Parks' },
    { key: 'number_of_licensed_tour_operators', label: 'Licensed Tour Operators' },
  ],
  operational_strength: [
    { key: 'years_of_experience', label: 'Years of Experience' },
    { key: 'travel_professionals_count', label: 'Travel Professionals' },
    { key: 'travellers_served_annually', label: 'Travellers Served Annually' },
    { key: 'hotel_partnerships_count', label: 'Hotel Partnerships' },
    { key: 'regions_of_expertise', label: 'Regions of Expertise' },
    { key: 'booking_systems', label: 'Booking Systems' },
    { key: 'languages_supported', label: 'Languages' },
    { key: 'additional_strength', label: 'Additional Strength' },
  ],
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#612178] bg-white transition-colors';
const labelCls = 'block text-xs font-semibold text-gray-700 mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function StepBadge({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i < step ? 'bg-[#612178] w-6' : i === step - 1 ? 'bg-[#a044c0] w-8' : 'bg-gray-200 w-4'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 font-medium">Step {step}/{total} — {label}</span>
    </div>
  );
}

// ─── Step 1: Common Profile ───────────────────────────────────────────────────

function Step1CommonProfile({
  profile,
  profileDocId,
  userId,
  onComplete,
}: {
  profile: UserProfile | null;
  profileDocId: string;
  userId: number;
  onComplete: (updatedProfile: UserProfile) => void;
}) {
  // General Info
  const [companyName,  setCompanyName]  = useState(profile?.company_name || '');
  const [mainCategory, setMainCategory] = useState<CategoryKey>((profile as any)?.category?.main || 'travel_trade');
  const [subCategories, setSubCategories] = useState<string[]>((profile as any)?.sub_categories || []);
  const [about,        setAbout]        = useState(typeof profile?.about === 'string' ? profile.about : '');
  
  const initialSocial = profile?.social_links || {};
  const [instagram,    setInstagram]    = useState(initialSocial.instagram || '');
  const [linkedin,     setLinkedin]     = useState(initialSocial.linkedin || '');
  const [facebook,     setFacebook]     = useState(initialSocial.facebook || '');
  const [website,      setWebsite]      = useState(profile?.website || initialSocial.website || '');

  // Profile image
  const [profileImg,    setProfileImg]    = useState<File | null>(null);
  const [profileImgUrl, setProfileImgUrl] = useState((profile as any)?.profileImageUrl || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Location
  const [country, setCountry] = useState(profile?.country || '');
  const [state,   setState]   = useState(profile?.state || '');
  const [city,    setCity]    = useState(profile?.city || '');

  // Contact
  const [contactName, setContactName] = useState((profile as any)?.contact_person_name || '');
  const [phone,       setPhone]       = useState((profile as any)?.mobile_number || '');
  const [email,       setEmail]       = useState(profile?.email || '');

  // Gallery
  const [gallery,      setGallery]      = useState<GalleryImage[]>((profile as any)?.gallery_images || []);
  const [galleryQueue, setGalleryQueue] = useState<File[]>([]);
  const [dragging,     setDragging]     = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);

  const cityOptions = CITIES[state] || [];

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'].includes(f.type)
    );
    setGalleryQueue((prev) => [...prev, ...files]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const textData = {
        company_name: companyName || undefined,
        about: about || undefined,
        category: { main: mainCategory, sub: subCategories },
        sub_categories: subCategories,
        country: country || undefined,
        state: state || undefined,
        city: city || undefined,
        contact_person_name: contactName || undefined,
        mobile_number: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        social_links: {
          instagram, linkedin, facebook, website,
        },
      };

      const result = await saveFullProfile(
        profileDocId,
        textData,
        profileImg || undefined,
        galleryQueue.length > 0 ? galleryQueue : undefined
      );

      if (result.success) {
        if (result.data?.gallery_images) {
          setGallery(result.data.gallery_images);
        }
        if (result.data?.profileImageUrl) {
          setProfileImgUrl(result.data.profileImageUrl);
        }
        setGalleryQueue([]);
        
        // Re-fetch updated profile then proceed
        const { profile: updated } = await getMyProfile(userId);
        onComplete((updated || profile) as UserProfile);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const removeQueuedPhoto = (i: number) =>
    setGalleryQueue((prev) => prev.filter((_, idx) => idx !== i));

  const handleDeleteGallery = async (url: string) => {
    const updated = await deleteGalleryPhoto(profileDocId, url);
    setGallery(updated);
  };

  return (
    <div className="space-y-6">
      {/* ── General Info ───────────────────────────────────────────── */}
      <Section title="General Info" icon={<Building2 size={16} />}>
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              {profileImgUrl || profileImg ? (
                <img
                  src={profileImg ? URL.createObjectURL(profileImg) : profileImgUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <User size={28} className="text-[#612178]" />
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#612178] text-white flex items-center justify-center shadow-lg hover:bg-[#4d1860] transition-colors"
              >
                <Camera size={12} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProfileImg(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Profile Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">Click the camera icon to update</p>
            </div>
          </div>

          <Field label="Company Name">
            <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Globix Tours Pvt Ltd" />
          </Field>

          <Field label="Business Category">
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8'} value={mainCategory} onChange={(e) => setMainCategory(e.target.value as CategoryKey)}>
                {MAIN_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <Field label="About">
            <textarea className={inputCls + ' resize-none'} rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell partners about your business…" />
          </Field>

          {/* Social Links */}
          <div>
            <label className={labelCls}>Social Links</label>
            <div className="space-y-3">
              {[
                { icon: <Instagram size={15} />, label: 'Instagram', value: instagram, set: setInstagram, ph: 'https://instagram.com/…' },
                { icon: <Linkedin size={15} />, label: 'LinkedIn',  value: linkedin,  set: setLinkedin,  ph: 'https://linkedin.com/company/…' },
                { icon: <Facebook size={15} />, label: 'Facebook',  value: facebook,  set: setFacebook,  ph: 'https://facebook.com/…' },
                { icon: <Globe size={15} />,    label: 'Website',   value: website,   set: setWebsite,   ph: 'https://yourwebsite.com' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">{s.icon}</div>
                  <input className={inputCls} value={s.value} onChange={(e) => s.set(e.target.value)} placeholder={s.ph} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Location ─────────────────────────────────────────────────── */}
      <Section title="Location" icon={<MapPin size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Country">
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8'} value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>
          <Field label="State">
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8'} value={state} onChange={(e) => { setState(e.target.value); setCity(''); }}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>
          <Field label="City">
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8'} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select city</option>
                {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Contact Person ────────────────────────────────────────────── */}
      <Section title="Contact Person" icon={<User size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Person Name">
            <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Rahul Sharma" />
          </Field>
          <Field label="Phone Number">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-3 bg-white shrink-0">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-400">+91</span>
              </div>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
            </div>
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
          </Field>
        </div>
      </Section>

      {/* ── Photos ────────────────────────────────────────────────────── */}
      <Section title="Photos" icon={<ImagePlus size={16} />}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${dragging ? 'border-[#612178] bg-purple-50' : 'border-gray-300 hover:border-[#612178] hover:bg-purple-50/50'}`}
        >
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => setGalleryQueue((prev) => [...prev, ...Array.from(e.target.files || [])])}
          />
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Upload size={22} className="text-[#612178]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Drag & drop or click to upload</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, JPEG, WEBP supported</p>
          </div>
        </div>

        {/* Queued (not yet uploaded) */}
        {galleryQueue.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">Pending upload ({galleryQueue.length})</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {galleryQueue.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full aspect-square object-cover rounded-xl border border-gray-100 opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
                    <span className="text-[10px] text-white font-semibold bg-black/50 px-2 py-0.5 rounded">Pending</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeQueuedPhoto(i); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Already uploaded gallery */}
        {gallery.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">Uploaded ({gallery.length})</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div key={img.url} className="relative group">
                  <img src={img.url} alt={img.name} className="w-full aspect-square object-cover rounded-xl border border-gray-100" />
                  <button
                    type="button"
                    onClick={() => handleDeleteGallery(img.url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Save & Next */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-[#612178] text-white text-sm font-bold hover:bg-[#4d1860] transition-colors disabled:opacity-60 shadow-lg shadow-purple-200"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {saving ? 'Saving…' : 'Save & Next'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Category Sections ────────────────────────────────────────────────

type ItemFormData = { title: string; description: string; image: File | null; extra_data: Record<string, string>; };
const emptyForm = (): ItemFormData => ({ title: '', description: '', image: null, extra_data: {} });

function ItemModal({ sectionKey, editItem, onClose, onSave, saving }: {
  sectionKey: string; editItem?: ProfileItem; onClose: () => void;
  onSave: (d: ItemFormData) => void; saving: boolean;
}) {
  const [form, setForm] = useState<ItemFormData>(() =>
    editItem ? { title: editItem.title || '', description: editItem.description || '', image: null,
      extra_data: Object.fromEntries(Object.entries(editItem.extra_data || {}).map(([k, v]) => [k, String(v ?? '')])),
    } : emptyForm()
  );
  const imgRef = useRef<HTMLInputElement>(null);
  const isTextarea = TEXTAREA_SECTIONS.has(sectionKey);
  const isMetrics  = METRICS_SECTIONS.has(sectionKey);
  const isTag      = TAG_SECTIONS.has(sectionKey);
  const hasImage   = IMAGE_SECTIONS.has(sectionKey);
  const fields     = METRICS_FIELDS[sectionKey] || [];
  const setExtra   = (k: string, v: string) => setForm((f) => ({ ...f, extra_data: { ...f.extra_data, [k]: v } }));
  const preview    = form.image ? URL.createObjectURL(form.image) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">{editItem ? 'Edit Item' : 'Add Item'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {isTextarea && (
            <Field label="Content">
              <textarea rows={7} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Enter details…" className={inputCls + ' resize-none'} />
            </Field>
          )}
          {isMetrics && fields.map((f) => (
            <Field key={f.key} label={f.label}>
              <input type="text" value={form.extra_data[f.key] || ''} onChange={(e) => setExtra(f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}`} className={inputCls} />
            </Field>
          ))}
          {!isTextarea && !isMetrics && (
            <>
              <Field label={isTag ? 'Item Name *' : 'Title *'}>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sedan Fleet, Delhi, Cultural Tourism" className={inputCls} />
              </Field>
              {!isTag && (
                <Field label="Description">
                  <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional…" className={inputCls + ' resize-none'} />
                </Field>
              )}
              {sectionKey === 'fleet' && (
                <>
                  <Field label="Vehicle Models"><input className={inputCls} value={form.extra_data.models || ''} onChange={(e) => setExtra('models', e.target.value)} placeholder="e.g. Toyota Etios, Honda City" /></Field>
                  <Field label="Count"><input className={inputCls} value={form.extra_data.count || ''} onChange={(e) => setExtra('count', e.target.value)} placeholder="e.g. 20" /></Field>
                </>
              )}
              {sectionKey === 'certifications' && (
                <Field label="Issued Date"><input className={inputCls} value={form.extra_data.issued_date || ''} onChange={(e) => setExtra('issued_date', e.target.value)} placeholder="e.g. Jan 2022" /></Field>
              )}
              {['product_portfolio', 'tourism_products', 'packages'].includes(sectionKey) && (
                <Field label="Location"><input className={inputCls} value={form.extra_data.location || ''} onChange={(e) => setExtra('location', e.target.value)} placeholder="e.g. Jaipur, India" /></Field>
              )}
              {(hasImage || editItem?.image_url) && (
                <Field label="Image">
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))} />
                  {preview ? (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                      <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-800 truncate">{form.image?.name}</p></div>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, image: null }))} className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><X size={12} /></button>
                    </div>
                  ) : editItem?.image_url ? (
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                      <img src={editItem.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <button type="button" onClick={() => imgRef.current?.click()} className="text-xs font-semibold text-[#612178]">Replace image</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => imgRef.current?.click()} className="w-full h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#612178] hover:text-[#612178] transition-colors">
                      <ImagePlus size={18} /><span className="text-xs font-medium">Upload image</span>
                    </button>
                  )}
                </Field>
              )}
            </>
          )}
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={() => onSave(form)} disabled={saving} className="flex-1 h-11 rounded-xl bg-[#612178] text-white text-sm font-semibold hover:bg-[#4d1860] flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}{editItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LocalProfileItem extends ProfileItem {
  _pendingFile?: File | null;
  _isNew?: boolean;
}

function SectionCard({ config, category, section, onAdd, onEdit, onDelete, onSave, isDirty, saving }: {
  config: SectionConfig; category: CategoryKey; section?: ProfileSection;
  onAdd: () => void; onEdit: (item: LocalProfileItem) => void; onDelete: (item: LocalProfileItem) => void;
  onSave: () => void; isDirty: boolean; saving: boolean;
}) {
  const items     = section?.profile_items || [];
  const isTA      = TEXTAREA_SECTIONS.has(config.key);
  const isMetrics = METRICS_SECTIONS.has(config.key);
  const isTag     = TAG_SECTIONS.has(config.key);
  const metricsFields = METRICS_FIELDS[config.key] || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-2 h-5 rounded-full bg-[#612178]" />
          <h3 className="font-bold text-gray-900 text-sm">{config.label}</h3>
          {items.length > 0 && <span className="text-[11px] bg-purple-100 text-[#612178] font-semibold px-2 py-0.5 rounded-full">{items.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              disabled={saving}
              className="flex items-center gap-1.5 text-[10px] font-bold bg-[#612178] text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-[#4d1860] transition-all animate-in fade-in zoom-in duration-300"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              SAVE CHANGES
            </button>
          )}
          <button type="button" onClick={onAdd} className="flex items-center gap-1.5 text-xs font-semibold text-[#612178] hover:bg-purple-50 px-3 py-1.5 rounded-lg">
            <Plus size={13} />{isTA || isMetrics ? 'Set' : 'Add'}
          </button>
        </div>
      </div>
      <div className="p-4">
        {items.length === 0 ? (
          <div className="py-7 flex flex-col items-center gap-2 text-gray-400">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><Plus size={16} /></div>
            <p className="text-xs font-medium">No items yet</p>
          </div>
        ) : isTA ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{items[0].description || items[0].title}</p>
        ) : isMetrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metricsFields.map((f) => {
              const val = items[0].extra_data?.[f.key];
              if (!val) return null;
              return (
                <div key={f.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-sm font-extrabold text-[#612178]">{String(val)}</p>
                </div>
              );
            })}
          </div>
        ) : isTag ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div key={item.documentId} className="group flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#612178] rounded-xl text-xs font-semibold">
                {item.title}
                <button type="button" onClick={() => onDelete(item)} className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center hover:bg-red-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: LocalProfileItem) => (
              <div key={item.documentId || `new-${item.title}-${item.order}`} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden">
                {item._isNew && <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-100 text-[#612178] text-[8px] font-bold rounded-bl-lg">NEW</div>}
                {(item.image_url || item._pendingFile) && (
                  <img 
                    src={item._pendingFile ? URL.createObjectURL(item._pendingFile) : item.image_url} 
                    alt="" 
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" 
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                  {item.extra_data && Object.values(item.extra_data).some(Boolean) && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {Object.entries(item.extra_data).filter(([, v]) => v).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-purple-50 text-[#612178] px-2 py-0.5 rounded-full font-medium">{k.replace(/_/g, ' ')}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button type="button" onClick={() => onEdit(item)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-[#612178] transition-colors"><Pencil size={13} /></button>
                  <button type="button" onClick={() => onDelete(item)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step2CategorySections({ profileDocId, initialCategory }: { profileDocId: string; initialCategory: CategoryKey }) {
  const [category,  setCategory]  = useState<CategoryKey>(initialCategory);
  const [sections,  setSections]  = useState<ProfileSection[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modalCfg,  setModalCfg]  = useState<SectionConfig | null>(null);
  const [editItem,  setEditItem]  = useState<LocalProfileItem | undefined>();
  const [saving,    setSaving]    = useState<string | null>(null); // section key being saved
  const [delTarget, setDelTarget] = useState<LocalProfileItem | null>(null);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getProfileSections(profileDocId);
      setSections(data);
      setLoading(false);
    })();
  }, [profileDocId]);

  const getOrUpsert = useCallback(async (cfg: SectionConfig): Promise<ProfileSection | null> => {
    const existing = sections.find((s) => s.section_key === cfg.key);
    if (existing) return existing;
    const created = await upsertProfileSection(profileDocId, { section_key: cfg.key, category, order: cfg.order });
    if (created) {
      const full = { ...created, profile_items: [] };
      setSections((prev) => [...prev, full]);
      return full;
    }
    return null;
  }, [profileDocId, sections, category]);

  const handleSaveItemLocally = async (formData: ItemFormData) => {
    if (!modalCfg) return;
    
    const titleVal = (TEXTAREA_SECTIONS.has(modalCfg.key) ? formData.description.slice(0, 60) : formData.title) || 'Item';
    const itemData: LocalProfileItem = {
      documentId: editItem?.documentId || `temp-${Math.random()}`,
      title: titleVal,
      description: formData.description || undefined,
      extra_data: Object.keys(formData.extra_data).length ? formData.extra_data : undefined,
      order: editItem?.order || 0,
      _pendingFile: formData.image,
      _isNew: !editItem?.documentId || editItem.documentId.startsWith('temp-'),
      image_url: editItem?.image_url || '',
    };

    setSections(prev => {
      const existingSection = prev.find(s => s.section_key === modalCfg.key);
      if (existingSection) {
        const newItems = editItem 
          ? existingSection.profile_items.map(i => i.documentId === editItem.documentId ? itemData : i)
          : [...(existingSection.profile_items || []), { ...itemData, order: (existingSection.profile_items?.length || 0) + 1 }];
        
        return prev.map(s => s.section_key === modalCfg.key ? { ...s, profile_items: newItems as ProfileItem[] } : s);
      } else {
        // Section doesn't exist yet in state - this shouldn't happen usually because we upsert,
        // but let's handle it by adding a skeleton section
        return [...prev, { 
          documentId: '', 
          section_key: modalCfg.key, 
          category, 
          order: modalCfg.order, 
          profile_items: [itemData as ProfileItem] 
        }];
      }
    });

    setDirtyKeys(prev => new Set(prev).add(modalCfg.key));
    setModalCfg(null); 
    setEditItem(undefined);
  };

  const syncSection = async (sectionKey: string) => {
    const section = sections.find(s => s.section_key === sectionKey);
    if (!section) return;

    setSaving(sectionKey);
    try {
      // 1. Ensure section exists on backend
      let secDocId = section.documentId;
      if (!secDocId) {
        const cfg = CATEGORY_SECTIONS[category].find(c => c.key === sectionKey);
        if (cfg) {
          const created = await upsertProfileSection(profileDocId, { section_key: sectionKey, category, order: cfg.order });
          if (created) secDocId = created.documentId;
        }
      }

      if (!secDocId) throw new Error("Could not create/find section");

      // 2. Handle images for items that have pending files
      const itemsToSync = await Promise.all(section.profile_items.map(async (item: any) => {
        const localItem = item as LocalProfileItem;
        let finalImageUrl = localItem.image_url;

        if (localItem._pendingFile) {
          try {
            const uploadRes = await uploadProfileMedia([localItem._pendingFile]);
            if (uploadRes && uploadRes[0]?.url) {
              finalImageUrl = uploadRes[0].url;
            }
          } catch (err) {
            console.error("Image upload failed for item:", localItem.title, err);
          }
        }

        // Prepare for batch sync (remove temp ID if it's new)
        const isTemp = !localItem.documentId || localItem.documentId.startsWith('temp-');
        return {
          documentId: isTemp ? undefined : localItem.documentId,
          title: localItem.title,
          description: localItem.description,
          order: localItem.order,
          extra_data: localItem.extra_data,
          image_url: finalImageUrl,
        };
      }));

      // 3. Call Batch Sync API
      const result = await batchSyncProfileItems(secDocId, itemsToSync);
      if (result.success) {
        setSections(prev => prev.map(s => s.section_key === sectionKey ? { ...s, documentId: secDocId, profile_items: result.data } : s));
        setDirtyKeys(prev => {
          const next = new Set(prev);
          next.delete(sectionKey);
          return next;
        });
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteLocally = (item: LocalProfileItem) => {
    const section = sections.find(s => s.profile_items.some(i => i.documentId === item.documentId));
    if (!section) return;

    setSections(prev => prev.map(s => s.documentId === section.documentId || s.section_key === section.section_key 
      ? { ...s, profile_items: s.profile_items.filter(i => i.documentId !== item.documentId) } 
      : s
    ));
    setDirtyKeys(prev => new Set(prev).add(section.section_key));
    setDelTarget(null);
  };

  const configs = CATEGORY_SECTIONS[category];

  return (
    <div className="space-y-6">
      {/* Category banner */}
      <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #612178 0%, #a044c0 60%, #d06de0 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-200 mb-1">Category</p>
        <h2 className="text-xl font-bold mb-3">{CATEGORY_LABELS[category]}</h2>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-purple-200 font-bold tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="animate-pulse" /> TEST CATEGORY SWITCHER (FRONTEND PREVIEW)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_SECTIONS) as CategoryKey[]).map((k) => (
              <button 
                key={k} 
                type="button" 
                onClick={() => setCategory(k)} 
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 ${category === k ? 'bg-white text-[#612178] shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {category === k && <Check size={10} />}
                {CATEGORY_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#612178]" /></div>
      ) : (
        configs.map((cfg) => (
          <SectionCard
            key={cfg.key} config={cfg} category={category}
            section={sections.find((s) => s.section_key === cfg.key)}
            onAdd={() => { setModalCfg(cfg); setEditItem(undefined); }}
            onEdit={(item) => { setModalCfg(cfg); setEditItem(item); }}
            onDelete={(item) => setDelTarget(item)}
            onSave={() => syncSection(cfg.key)}
            isDirty={dirtyKeys.has(cfg.key)}
            saving={saving === cfg.key}
          />
        ))
      )}

      {modalCfg && (
        <ItemModal sectionKey={modalCfg.key} editItem={editItem}
          onClose={() => { setModalCfg(null); setEditItem(undefined); }}
          onSave={handleSaveItemLocally} saving={false}
        />
      )}
      {delTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 mb-1">Delete Item?</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete <strong>{delTarget.title}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)} className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteLocally(delTarget)} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper component ────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#612178]">{icon}</div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EnhanceProfilePage() {
  const router = useRouter();
  const user   = useAuth();

  const [step,         setStep]         = useState<1 | 2>(1);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [profileDocId, setProfileDocId] = useState<string>('');
  const [initCategory, setInitCategory] = useState<CategoryKey>('travel_trade');
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { exists, profile: p } = await getMyProfile(user.id);
      if (exists && p?.documentId) {
        // Fetch full profile with sections and items for Step 2
        const fullProf = await getFullProfile(p.documentId);
        const activeProfile = fullProf || p;
        
        setProfile(activeProfile as any);
        setProfileDocId(activeProfile.documentId || '');
        if ((activeProfile as any).category?.main) {
          setInitCategory((activeProfile as any).category.main);
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const STEPS = ['Common Profile', 'Business Sections'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#612178]" />
          <p className="text-sm text-gray-500 font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px]">
      <Header />

      {/* Top bar */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button type="button" onClick={() => step === 1 ? router.push('/home') : setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#612178] font-medium transition-colors shrink-0">
            <ArrowLeft size={16} />{step === 1 ? 'Back' : 'Previous'}
          </button>
          <div className="flex-1">
            <StepBadge step={step} total={2} label={STEPS[step - 1]} />
          </div>
          {step === 2 && (
            <button type="button" onClick={() => router.push('/home')} className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#612178] text-white text-xs font-bold hover:bg-[#4d1860] transition-colors shrink-0">
              <Check size={13} />Finish
            </button>
          )}
        </div>
      </div>

      {/* Step header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#612178] to-[#a044c0] flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Common Profile Info' : 'Business Sections'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 1
                ? 'Set up your company info, location, contact & photos'
                : 'Add detailed sections specific to your business category'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {step === 1 ? (
          <Step1CommonProfile
            profile={profile}
            profileDocId={profileDocId}
            userId={user?.id || 0}
            onComplete={(updated) => {
              setProfile(updated as any);
              setStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <Step2CategorySections
            profileDocId={profileDocId}
            initialCategory={initCategory}
          />
        )}
      </div>
    </div>
  );
}
