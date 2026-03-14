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

const TEXTAREA_SECTIONS = new Set(['trade_terms', 'driver_safety', 'trade_support', 'destination_overview', 'safety_guidelines']);
const METRICS_SECTIONS = new Set(['tourism_infrastructure', 'operational_strength', 'operational_capacity']);
const TAG_SECTIONS = new Set(['services', 'transport_services', 'experiences']);
const IMAGE_SECTIONS = new Set(['destinations', 'product_portfolio', 'packages', 'locations', 'tourism_products', 'certifications', 'operational_coverage']);

const METRICS_FIELDS: Record<string, { key: string; label: string; type: 'input' | 'textarea' | 'tags'; options?: string[] }[]> = {
  tourism_infrastructure: [
    { key: 'number_of_hotels', label: 'Hotels', type: 'input' },
    { key: 'number_of_international_airports', label: 'International Airports', type: 'input' },
    { key: 'number_of_major_attractions', label: 'Major Attractions', type: 'input' },
    { key: 'number_of_convention_centres', label: 'Convention Centres', type: 'input' },
    { key: 'number_of_national_parks', label: 'National Parks', type: 'input' },
    { key: 'number_of_licensed_tour_operators', label: 'Licensed Tour Operators', type: 'input' },
  ],
  operational_strength: [
    { key: 'years_of_experience', label: 'Years Of Experience', type: 'input' },
    { key: 'travel_professionals_count', label: 'No. Of Travel Professional', type: 'input' },
    { key: 'travellers_served_annually', label: 'No. Of Travelers Served Annually', type: 'input' },
    { key: 'regions_of_expertise', label: 'Regions Of Expertise', type: 'tags', options: ['Europe', 'South East Asia', 'Middle East', 'USA', 'Africa'] },
    { key: 'booking_systems', label: 'Select Booking Systems', type: 'tags', options: ['Amadeus', 'Sabre', 'Galileo', 'Others'] },
    { key: 'hotel_partnerships_count', label: 'No. Of Hotels Partnered', type: 'input' },
    { key: 'languages_supported', label: 'Select Languages', type: 'tags', options: ['English', 'Hindi', 'Spanish', 'French', 'Arabic'] },
    { key: 'additional_strength', label: 'Type Additional Strength', type: 'textarea' },
  ],
  operational_capacity: [
    { key: 'daily_capacity', label: 'Daily Guest Capacity', type: 'input' },
    { key: 'min_group_size', label: 'Minimum Group Size', type: 'input' },
    { key: 'max_group_size', label: 'Maximum Group Size', type: 'input' },
    { key: 'duration_options', label: 'Duration Options', type: 'tags', options: ['1 Hour', 'Half Day', 'Full Day', 'Multi Day'] },
    { key: 'seasonal_availability', label: 'Seasonal Peak', type: 'input' },
  ],
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#612178] bg-white transition-all hover:border-gray-300';
const labelCls = 'block text-[13px] font-semibold text-gray-700 mb-2';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Sidebar({ items, activeId, onScrollTo }: { items: { id: string; label: string }[]; activeId: string; onScrollTo: (id: string) => void }) {
  return (
    <div className="w-64 shrink-0 hidden lg:block sticky top-[100px] h-fit">
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onScrollTo(item.id)}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              activeId === item.id
                ? 'bg-[#F3E8FF] text-[#612178] shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Common Profile ───────────────────────────────────────────────────

function StepBadge({ step, total, label }: { step: number, total: number, label: string }) {
  return (
    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-1.5 pr-5 rounded-2xl border border-gray-100 shadow-sm w-fit">
      <div className="flex -space-x-1">
        {[...Array(total)].map((_, i) => (
          <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${i + 1 === step ? 'bg-[#612178] text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400'}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Step {step} of {total}</span>
        <span className="text-sm font-bold text-gray-900 leading-tight">{label}</span>
      </div>
    </div>
  );
}

function UnifiedCommonProfile({
  profile,
  profileDocId,
  userId,
  onUpdateProfile,
  sectionRefs,
  category,
  setCategory,
  onNext,
}: {
  profile: UserProfile | null;
  profileDocId: string;
  userId: number;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  category: CategoryKey;
  setCategory: (c: CategoryKey) => void;
  onNext: () => void;
}) {
  // General Info
  const [companyName,  setCompanyName]  = useState(profile?.company_name || '');
  const [subCategories, setSubCategories] = useState<string[]>((profile as any)?.sub_categories || []);
  const [about,        setAbout]        = useState(typeof profile?.about === 'string' ? profile.about : '');
  
  const initialSocial = profile?.social_links || {};
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    instagram: initialSocial.instagram || '',
    linkedin: initialSocial.linkedin || '',
    facebook: initialSocial.facebook || '',
    twitter: initialSocial.twitter || '',
    youtube: initialSocial.youtube || '',
  });
  const [website, setWebsite] = useState(profile?.website || initialSocial.website || '');
  const [activeSocials, setActiveSocials] = useState<string[]>(
    Object.keys(initialSocial).filter(k => k !== 'website' && initialSocial[k])
  );

  // Profile image
  const [profileImg,    setProfileImg]    = useState<File | null>(null);
  const [profileImgUrl, setProfileImgUrl] = useState((profile as any)?.profileImageUrl || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Location
  const [country, setCountry] = useState(profile?.country || '');
  const [state,   setState]   = useState(profile?.state || '');
  const [city,    setCity]    = useState(profile?.city || '');

  // Contact
  const [contactImg,    setContactImg]    = useState<File | null>(null);
  const [contactImgUrl, setContactImgUrl] = useState((profile as any)?.contact_person_image_url || '');
  const contactImgInputRef = useRef<HTMLInputElement>(null);
  
  const rawContact = (profile as any)?.contact_person_name;
  const initialContactName = Array.isArray(rawContact) && rawContact.length > 0 
    ? rawContact[0].name 
    : (typeof rawContact === 'string' ? rawContact : '');
  const [contactName, setContactName] = useState(initialContactName || '');
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

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const textData = {
        company_name: companyName || undefined,
        about: about || undefined,
        category: { main: category, sub: subCategories },
        sub_categories: subCategories,
        country: country || undefined,
        state: state || undefined,
        city: city || undefined,
        contact_person_name: contactName ? [
          {
            name: contactName,
            email: email || '',
            position: 'Owner', // Default role since UI has 1 contact slot
            phone_number: phone ? (phone.startsWith('+91-') ? phone : `+91-${phone.replace(/^\+91/, '')}`) : ''
          }
        ] : [],
        mobile_number: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        social_links: {
          ...socialLinks, website,
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
        const { profile: updated } = await getMyProfile(userId);
        onUpdateProfile((updated || profile) as UserProfile);
        onNext(); // Transition to Step 2
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
    const res = await deleteGalleryPhoto(profileDocId, url);
    if (res.success && res.data?.gallery_images) {
      setGallery(res.data.gallery_images);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── General Info ───────────────────────────────────────────── */}
      <div ref={(el) => { sectionRefs.current.general = el; }} className="scroll-mt-24">
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner area */}
          <div className="h-44 bg-gradient-to-r from-red-500 via-pink-500 to-red-400 relative">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
             <div className="absolute right-6 top-6">
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
                >
                  <Camera size={20} />
                </button>
             </div>
             {/* Profile Image Overlay */}
             <div className="absolute -bottom-10 left-8">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-100">
                      {profileImgUrl || profileImg ? (
                        <img
                          src={profileImg ? URL.createObjectURL(profileImg) : profileImgUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={48} className="text-gray-300" />
                        </div>
                      )}
                   </div>
                   <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#612178] text-white flex items-center justify-center shadow-lg hover:bg-[#4d1860] transition-colors border-4 border-white"
                   >
                    <Camera size={14} />
                   </button>
                </div>
             </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Field label="Categories">
                  <div className="relative">
                    <select className={inputCls + ' appearance-none pr-8 bg-gray-50/50 border-gray-100'} value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
                      {MAIN_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
               </Field>
               <Field label="Sub Categories">
                  <div className="relative">
                    <select className={inputCls + ' appearance-none pr-8 bg-gray-50/50 border-gray-100'}>
                      <option>Select Sub Categories</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
               </Field>
            </div>

            <Field label="Name Of The Company">
              <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" />
            </Field>

            <Field label="About">
              <textarea className={inputCls + ' resize-none'} rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Type about your company here..." />
            </Field>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setProfileImg(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </div>

      {/* ── Location ─────────────────────────────────────────────────── */}
      <div ref={(el) => { sectionRefs.current.location = el; }} className="scroll-mt-24">
        <Section title="Location" icon={<MapPin size={16} />}>
          <div className="space-y-4">
            <Field label="Country">
              <div className="relative">
                <select className={inputCls + ' appearance-none pr-8'} value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </Section>
      </div>

      {/* ── Contact Person ────────────────────────────────────────────── */}
      <div ref={(el) => { sectionRefs.current.contact = el; }} className="scroll-mt-24">
        <Section title="Contact Person" icon={<User size={16} />}>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                {contactImgUrl || contactImg ? (
                  <img src={contactImg ? URL.createObjectURL(contactImg) : contactImgUrl} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={24} className="text-gray-300" />
                )}
              </div>
              <button 
                type="button" 
                onClick={() => contactImgInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl bg-[#612178] text-white text-xs font-bold hover:bg-[#4d1860] transition-all shadow-md"
              >
                Upload Profile Image
              </button>
              <input ref={contactImgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setContactImg(e.target.files?.[0] || null)} />
            </div>

            <Field label="Name Of Contact Person">
              <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Enter name of contact person" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone No">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 text-sm font-medium">
                    +91
                  </div>
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone No" />
                </div>
              </Field>
              <Field label="E-mail ID">
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail ID" />
              </Field>
            </div>

            <Field label="Website">
              <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
            </Field>

            <div className="space-y-4 pt-2">
              <Field label="Add Social Media Profile">
                <div className="relative">
                  <select 
                    className={inputCls + ' appearance-none pr-8'}
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !activeSocials.includes(val)) {
                        setActiveSocials(prev => [...prev, val]);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>Select Social Platform</option>
                    {['instagram', 'linkedin', 'facebook', 'twitter', 'youtube'].filter(v => !activeSocials.includes(v)).map(platform => (
                      <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>
              {activeSocials.map(platform => (
                <div key={platform} className="flex gap-3">
                  <div className="w-[140px] h-12 flex items-center gap-2 px-3 border border-gray-200 rounded-xl bg-white overflow-hidden shrink-0">
                    {platform === 'instagram' && <Instagram size={18} className="text-pink-600 shrink-0" />}
                    {platform === 'linkedin' && <Linkedin size={18} className="text-blue-700 shrink-0" />}
                    {platform === 'facebook' && <Facebook size={18} className="text-blue-600 shrink-0" />}
                    {platform === 'twitter' && <Twitter size={18} className="text-sky-500 shrink-0" />}
                    {platform === 'youtube' && <Youtube size={18} className="text-red-600 shrink-0" />}
                    <span className="text-sm font-semibold capitalize truncate flex-1">{platform}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setActiveSocials(prev => prev.filter(p => p !== platform));
                        setSocialLinks(prev => ({ ...prev, [platform]: '' }));
                      }}
                      className="text-red-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input 
                    className={inputCls} 
                    placeholder="Web Address" 
                    value={socialLinks[platform]} 
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))} 
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Photos ────────────────────────────────────────────────────── */}
      <div ref={(el) => { sectionRefs.current.photos = el; }} className="scroll-mt-24">
        <Section title="Photos" icon={<ImagePlus size={16} />}>
          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => galleryInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragging ? 'border-[#612178] bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'}`}
            >
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => setGalleryQueue((prev) => [...prev, ...Array.from(e.target.files || [])])}
              />
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <ImagePlus size={32} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-gray-700">Drop your image here, or Browse</p>
                <p className="text-sm text-gray-400 mt-1">Support : PNG,JPG,JPEG,WEBP</p>
              </div>
            </div>

            {(gallery.length > 0 || galleryQueue.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.url} className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button onClick={() => handleDeleteGallery(img.url)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                ))}
                {galleryQueue.map((f, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden group bg-gray-100 opacity-60 flex items-center justify-center">
                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-white" /></div>
                    <button onClick={() => removeQueuedPhoto(i)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="flex justify-end pt-4 pb-12 border-t border-gray-100">
        <button
          onClick={handleSaveAndContinue}
          disabled={saving}
          className="flex items-center gap-2 h-14 px-10 rounded-2xl bg-[#612178] text-white text-base font-bold hover:bg-[#4d1860] transition-all disabled:opacity-60 shadow-xl shadow-purple-200"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Category Sections ────────────────────────────────────────────────

type ItemEntry = { title: string; description: string; image: File | null; extra_data: Record<string, string>; };
type ItemFormData = { items: ItemEntry[] };
const emptyEntry = (): ItemEntry => ({ title: '', description: '', image: null, extra_data: {} });

function ItemModal({ sectionKey, editItem, onClose, onSave, saving }: {
  sectionKey: string; editItem?: LocalProfileItem; onClose: () => void;
  onSave: (d: ItemFormData) => void; saving: boolean;
}) {
  const [items, setItems] = useState<ItemEntry[]>(() =>
    editItem ? [{ 
      title: editItem.title || '', 
      description: editItem.description || '', 
      image: null,
      extra_data: Object.fromEntries(Object.entries(editItem.extra_data || {}).map(([k, v]) => [k, String(v ?? '')])),
    }] : [emptyEntry()]
  );
  
  const imgRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isTextarea = TEXTAREA_SECTIONS.has(sectionKey);
  const isMetrics  = METRICS_SECTIONS.has(sectionKey);
  const isTag      = TAG_SECTIONS.has(sectionKey);
  const hasImage   = IMAGE_SECTIONS.has(sectionKey);
  const fields     = METRICS_FIELDS[sectionKey] || [];

  const updateEntry = (idx: number, patch: Partial<ItemEntry>) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const updateExtra = (idx: number, k: string, v: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, extra_data: { ...it.extra_data, [k]: v } } : it));
  };

  const addRow = () => setItems(prev => [...prev, emptyEntry()]);
  const removeRow = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">{editItem ? 'Edit Item' : 'Add Multiple Items'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
          {items.map((form, idx) => {
            const preview = form.image ? URL.createObjectURL(form.image) : null;
            return (
              <div key={idx} className={`relative p-5 rounded-2xl border-2 ${items.length > 1 ? 'border-purple-100 bg-purple-50/20' : 'border-gray-50'}`}>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRow(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
                  >
                    <X size={12} />
                  </button>
                )}

                <div className="space-y-4">
                  {isMetrics && fields.map((f) => (
                    <Field key={f.key} label={f.label}>
                      {f.type === 'textarea' ? (
                        <textarea rows={3} value={form.extra_data[f.key] || ''} onChange={(e) => updateExtra(idx, f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}`} className={inputCls + ' resize-none'} />
                      ) : f.type === 'tags' ? (
                        <div className="space-y-2">
                           <div className="relative">
                              <select 
                                className={inputCls + ' appearance-none pr-8 bg-gray-50/50'} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  const current = form.extra_data[f.key] ? form.extra_data[f.key].split(',').filter(Boolean) : [];
                                  if (!current.includes(val)) {
                                    updateExtra(idx, f.key, [...current, val].join(','));
                                  }
                                }}
                              >
                                <option value="">{f.label}</option>
                                {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {(form.extra_data[f.key] ? form.extra_data[f.key].split(',').filter(Boolean) : []).map(tag => (
                                <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-[#612178] rounded-lg text-xs font-bold">
                                  {tag}
                                  <button 
                                    onClick={() => {
                                      const current = form.extra_data[f.key].split(',').filter(Boolean);
                                      updateExtra(idx, f.key, current.filter(t => t !== tag).join(','));
                                    }}
                                    className="hover:text-red-500"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                           </div>
                        </div>
                      ) : (
                        <input type="text" value={form.extra_data[f.key] || ''} onChange={(e) => updateExtra(idx, f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}`} className={inputCls} />
                      )}
                    </Field>
                  ))}
                  {!isTextarea && !isMetrics && (
                    <>
                      <Field label={sectionKey === 'certifications' ? 'Certification Name *' : sectionKey === 'fleet' ? 'Type of Car *' : "Item Name *"}>
                        <input type="text" value={form.title} onChange={(e) => updateEntry(idx, { title: e.target.value })} placeholder={sectionKey === 'certifications' ? "e.g. ISO 9001" : sectionKey === 'fleet' ? "e.g. Sedan, SUV, etc" : "e.g. Cultural Tourism"} className={inputCls} />
                      </Field>
                      
                      {sectionKey === 'certifications' && (
                        <div className="grid grid-cols-2 gap-4">
                           <Field label="Company Name">
                              <input className={inputCls} value={form.extra_data.company_name || ''} onChange={(e) => updateExtra(idx, 'company_name', e.target.value)} placeholder="Company Name" />
                           </Field>
                           <Field label="Issued At">
                              <input className={inputCls} value={form.extra_data.issued_at || ''} onChange={(e) => updateExtra(idx, 'issued_at', e.target.value)} placeholder="XX-XX-202X" />
                           </Field>
                        </div>
                      )}

                      {!isTag && sectionKey !== 'certifications' && sectionKey !== 'fleet' && (
                        <Field label="Description">
                          <textarea rows={2} value={form.description} onChange={(e) => updateEntry(idx, { description: e.target.value })} placeholder="Optional details…" className={inputCls + ' resize-none'} />
                        </Field>
                      )}

                      {sectionKey === 'product_portfolio' && (
                         <Field label="Location">
                            <input className={inputCls} value={form.extra_data.location || ''} onChange={(e) => updateExtra(idx, 'location', e.target.value)} placeholder="e.g. Jaipur, India" />
                         </Field>
                      )}

                      {sectionKey === 'fleet' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Vehicle Models"><input className={inputCls} value={form.extra_data.models || ''} onChange={(e) => updateExtra(idx, 'models', e.target.value)} placeholder="e.g. Innova, Swift" /></Field>
                          <Field label="Count"><input className={inputCls} value={form.extra_data.count || ''} onChange={(e) => updateExtra(idx, 'count', e.target.value)} placeholder="e.g. 5" /></Field>
                        </div>
                      )}
                      {(hasImage || (editItem && idx === 0 && editItem.image_url)) && (
                        <Field label="Image">
                          <input ref={el => { imgRefs.current[idx] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => updateEntry(idx, { image: e.target.files?.[0] || null })} />
                          {preview ? (
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                              <img src={preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0"><p className="text-[10px] font-medium text-gray-500 truncate">{form.image?.name}</p></div>
                              <button type="button" onClick={() => updateEntry(idx, { image: null })} className="text-red-500"><X size={14} /></button>
                            </div>
                          ) : (editItem && idx === 0 && editItem.image_url) ? (
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                              <img src={editItem.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <button type="button" onClick={() => imgRefs.current[idx]?.click()} className="text-xs font-bold text-[#612178]">Replace</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => imgRefs.current[idx]?.click()} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-[#612178] hover:text-[#612178] transition-all">
                              <Plus size={14} /><span className="text-xs font-semibold">Upload Image</span>
                            </button>
                          )}
                        </Field>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {!isTextarea && !isMetrics && !editItem && (
            <button 
              type="button" 
              onClick={addRow} 
              className="w-full py-4 border-2 border-dashed border-purple-200 rounded-2xl flex items-center justify-center gap-2 text-[#612178] bg-purple-50/50 hover:bg-purple-50 transition-all font-bold text-sm"
            >
              <Plus size={18} /> Add Another Item Row
            </button>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
          <button 
            type="button" 
            onClick={() => {
              const validItems = items.filter(it => isTextarea ? it.description.trim() : (isMetrics ? true : it.title.trim()));
              if (validItems.length > 0) onSave({ items: validItems });
            }} 
            disabled={saving || !items.some(it => isTextarea ? it.description.trim() : (isMetrics ? true : it.title.trim()))} 
            className="flex-1 h-12 rounded-2xl bg-[#612178] text-white text-sm font-bold hover:bg-[#4d1860] transition-all disabled:opacity-50 shadow-lg shadow-purple-100"
          >
            {editItem ? 'Update Item' : `Add to List`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Card Component ──────────────────────────────────────────────────

interface LocalProfileItem extends ProfileItem {
  _pendingFile?: File | null;
  _isNew?: boolean;
}

function SectionCard({ config, category, section, onAdd, onEdit, onDelete, onSave, isDirty, saving, sectionRefs, onUpdateTextarea }: {
  config: SectionConfig; category: CategoryKey; section?: ProfileSection;
  onAdd?: () => void; onEdit?: (item: LocalProfileItem) => void; onDelete?: (item: LocalProfileItem) => void;
  onSave: () => void; isDirty: boolean; saving: boolean; sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>; onUpdateTextarea?: (text: string) => void;
}) {
  const items     = section?.profile_items || [];
  const isTA      = TEXTAREA_SECTIONS.has(config.key);
  const isMetrics = METRICS_SECTIONS.has(config.key);
  const isTag     = TAG_SECTIONS.has(config.key);
  const metricsFields = METRICS_FIELDS[config.key] || [];

  return (
    <div ref={(el) => { sectionRefs.current[config.key] = el; }} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden scroll-mt-24">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-900 text-[15px]">{config.label}</h3>
          {items.length > 0 && <span className="text-[11px] bg-purple-100 text-[#612178] font-bold px-2 py-0.5 rounded-full">{items.length}</span>}
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              disabled={saving}
              className="flex items-center gap-1.5 text-[11px] font-bold bg-[#612178] text-white px-4 py-2 rounded-xl shadow-lg shadow-purple-100 hover:bg-[#4d1860] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              SAVE
            </button>
          )}
          
          {!isTA && onAdd && (
            <button 
              type="button" 
              onClick={onAdd}
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#612178] hover:bg-purple-50 px-4 py-2 rounded-xl transition-all"
            >
              <Plus size={16} />{isMetrics ? (items.length > 0 ? 'Edit' : 'Set') : 'Add'}
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {isTA ? (
          <textarea
            value={items.length > 0 ? (items[0].description || items[0].title || '') : ''}
            onChange={(e) => onUpdateTextarea?.(e.target.value)}
            placeholder={`Enter ${config.label.toLowerCase()} details here...`}
            className="w-full px-4 py-3 text-[15px] border border-gray-200 rounded-xl focus:outline-none focus:border-[#612178] bg-gray-50/50 resize-y min-h-[140px] text-gray-700 leading-relaxed"
          />
        ) : items.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3 text-gray-400">

            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><Plus size={20} /></div>
            <p className="text-sm font-semibold">No {config.label.toLowerCase()} added yet</p>
          </div>
        ) : isMetrics ? (
          <div className="space-y-4">
            {metricsFields.map((f) => {
              const val = items[0].extra_data?.[f.key];
              if (!val) return null;
              return (
                <div key={f.key} className="space-y-2">
                   <p className="text-[13px] font-semibold text-gray-700">{f.label}</p>
                   {f.type === 'tags' ? (
                      <div className="flex flex-wrap gap-2">
                        {String(val).split(',').filter(Boolean).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-purple-50 text-[#612178] rounded-lg text-xs font-bold border border-purple-100/50">{tag}</span>
                        ))}
                      </div>
                   ) : (
                      <p className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 text-sm text-gray-800">{String(val)}</p>
                   )}
                </div>
              );
            })}
          </div>
        ) : isTag ? (
          <div className="flex flex-wrap gap-2.5">
            {items.map((item) => (
              <div key={item.documentId} className="group flex items-center gap-2 pl-4 pr-2 py-2 bg-purple-50/80 text-[#612178] rounded-xl text-sm font-bold border border-purple-100/50">
                {item.title}
                {onDelete && <button type="button" onClick={() => onDelete(item)} className="w-5 h-5 rounded-lg bg-white/50 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"><X size={12} /></button>}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item: LocalProfileItem) => (
              <div key={item.documentId || `new-${item.title}-${item.order}`} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center group hover:border-[#612178]/30 hover:shadow-md transition-all relative">
                {(item.image_url || item._pendingFile) && (
                  <div className={`rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm ${config.key === 'certifications' ? 'w-24 h-16' : 'w-20 h-20'}`}>
                    <img 
                      src={item._pendingFile ? URL.createObjectURL(item._pendingFile) : item.image_url} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                    {item.title}
                    {config.key === 'certifications' && <span className="text-[10px] text-gray-400 font-normal">1</span>}
                  </p>
                  
                  {config.key === 'certifications' && (
                    <div className="mt-0.5 space-y-0.5">
                       <p className="text-xs text-gray-500">{item.extra_data?.company_name || 'Company Name'}</p>
                       <p className="text-[11px] text-gray-400">Issued At : {item.extra_data?.issued_at || 'XX-XX-202X'}</p>
                    </div>
                  )}

                  {config.key === 'product_portfolio' && item.extra_data?.location && (
                     <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {item.extra_data.location}
                     </p>
                  )}

                  {item.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                </div>
                
                <div className="flex gap-2">
                   {onEdit && <button type="button" onClick={() => onEdit(item)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-purple-50 hover:text-[#612178] transition-all"><Pencil size={18} /></button>}
                   {onDelete && <button type="button" onClick={() => onDelete(item)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step2CategorySections({ profileDocId, initialCategory, sectionRefs }: { 
  profileDocId: string; 
  initialCategory: CategoryKey; 
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const [category, setCategory] = useState<CategoryKey>(initialCategory);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);
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
    const isTextarea = TEXTAREA_SECTIONS.has(modalCfg.key);
    const isMetrics = METRICS_SECTIONS.has(modalCfg.key);

    const filterEmpty = formData.items.filter(it => {
      if (isTextarea) return it.description.trim();
      if (isMetrics) return true;
      return it.title.trim();
    });

    if (filterEmpty.length === 0) {
      setModalCfg(null);
      setEditItem(undefined);
      return;
    }

    const newItemsData: LocalProfileItem[] = filterEmpty.map((it, idx) => {
      const titleVal = (isTextarea ? it.description.slice(0, 60) : it.title) || 'Item';
      return {
        documentId: editItem && idx === 0 ? editItem.documentId : `temp-${Math.random()}-${idx}`,
        title: titleVal,
        description: it.description || undefined,
        extra_data: Object.keys(it.extra_data).length ? it.extra_data : undefined,
        order: editItem && idx === 0 ? editItem.order : 0,
        _pendingFile: it.image,
        _isNew: !editItem || (idx > 0),
        image_url: editItem && idx === 0 ? editItem.image_url : '',
      };
    });

    setSections(prev => {
      const existingSection = prev.find(s => s.section_key === modalCfg.key);
      if (existingSection) {
        let updatedItems: ProfileItem[];
        if (editItem) {
          // Edit mode: replace the one being edited, ignore others if any (modal only shows 1 during edit)
          updatedItems = existingSection.profile_items.map(i => i.documentId === editItem.documentId ? newItemsData[0] : i);
        } else {
          // Add mode: append all new items with correct order
          const startOrder = existingSection.profile_items?.length || 0;
          const itemsWithOrder = newItemsData.map((it, i) => ({ ...it, order: startOrder + i + 1 }));
          updatedItems = [...(existingSection.profile_items || []), ...itemsWithOrder];
        }
        
        return prev.map(s => s.section_key === modalCfg.key ? { ...s, profile_items: updatedItems as ProfileItem[] } : s);
      } else {
        const itemsWithOrder = newItemsData.map((it, i) => ({ ...it, order: i + 1 }));
        return [...prev, { 
          documentId: '', 
          section_key: modalCfg.key, 
          category, 
          order: modalCfg.order, 
          profile_items: itemsWithOrder as ProfileItem[] 
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

      // 2. Prepare items and collect binary files
      const pendingFiles: File[] = [];
      const itemsToSync = section.profile_items.map((item: any) => {
        const localItem = item as LocalProfileItem;
        const isTemp = !localItem.documentId || localItem.documentId.startsWith('temp-');
        const syncData: any = {
          documentId: isTemp ? undefined : localItem.documentId,
          title: localItem.title,
          description: localItem.description,
          order: localItem.order,
          extra_data: localItem.extra_data,
          image_url: localItem.image_url,
        };

        if (localItem._pendingFile) {
          pendingFiles.push(localItem._pendingFile);
          syncData._image_index = pendingFiles.length - 1; // 0-based index of the file
        }
        return syncData;
      });

      // 3. Call Batch Sync API with binary files
      const result = await batchSyncProfileItems(secDocId, itemsToSync, pendingFiles);
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

    setSections(prev => prev.map(s => (s.documentId === section.documentId || s.section_key === section.section_key) 
      ? { ...s, profile_items: s.profile_items.filter(i => (i as any).documentId !== (item as any).documentId) } 
      : s
    ));
    setDirtyKeys(prev => new Set(prev).add(section.section_key));
    setDelTarget(null);
  };

  const handleUpdateTextarea = (sectionKey: string, text: string) => {
    setSections(prev => {
      const existing = prev.find(s => s.section_key === sectionKey);
      let updatedItems = existing?.profile_items || [];
      if (updatedItems.length === 0) {
        updatedItems = [{ documentId: `temp-${Math.random()}`, title: text.slice(0, 60) || 'Item', description: text, order: 1 } as ProfileItem];
      } else {
        updatedItems = [{ ...updatedItems[0], title: text.slice(0, 60) || 'Item', description: text }];
      }
      if (existing) {
        return prev.map(s => s.section_key === sectionKey ? { ...s, profile_items: updatedItems } : s);
      } else {
        return [...prev, { documentId: '', section_key: sectionKey, category, order: 1, profile_items: updatedItems }];
      }
    });
    setDirtyKeys(prev => new Set(prev).add(sectionKey));
  };

  const configs = CATEGORY_SECTIONS[category];

  return (
    <div className="space-y-6">
      {/* Removed TEST CATEGORY SWITCHER (FRONTEND PREVIEW) entirely */}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#612178]" /></div>
      ) : (
        configs.map((cfg) => (
          <SectionCard
            key={cfg.key} config={cfg} category={category}
            section={sections.find((s) => s.section_key === cfg.key)}
            onAdd={() => { setModalCfg(cfg); setEditItem(undefined); }}
            onEdit={(item: any) => { setModalCfg(cfg); setEditItem(item); }}
            onDelete={(item: any) => setDelTarget(item)}
            onSave={() => syncSection(cfg.key)}
            isDirty={dirtyKeys.has(cfg.key)}
            saving={saving === cfg.key}
            sectionRefs={sectionRefs}
            onUpdateTextarea={(text) => handleUpdateTextarea(cfg.key, text)}
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
  const user = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileDocId, setProfileDocId] = useState<string>('');
  const [initCategory, setInitCategory] = useState<CategoryKey>('travel_trade');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('general');

  // Refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { exists, profile: p } = await getMyProfile(user.id);
        if (exists && p) {
          const id = p.documentId || (p as any).id?.toString();
          if (id) {
            const fullProf = await getFullProfile(id);
            const activeProfile = fullProf || p;
            setProfile(activeProfile as any);
            setProfileDocId(activeProfile.documentId || (activeProfile as any).id?.toString() || '');
            if ((activeProfile as any).category?.main) {
              setInitCategory((activeProfile as any).category.main);
            }
          }
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const intersecting = entries.filter(e => e.isIntersecting);
      if (intersecting.length > 0) {
        intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topEntry = intersecting[0];
        const id = Object.keys(sectionRefs.current).find(key => sectionRefs.current[key] === topEntry.target);
        if (id) setActiveSection(id);
      }
    };
    const observer = new IntersectionObserver(observerCallback, { root: null, rootMargin: '-120px 0px -60% 0px', threshold: 0 });
    const timeout = setTimeout(() => {
      Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    }, 200);
    return () => { clearTimeout(timeout); observer.disconnect(); };
  }, [step, loading]);

  const handleScrollTo = (id: string, updateStep = true) => {
    if (updateStep) {
      const categoryItemIds = (CATEGORY_SECTIONS[initCategory] || []).map(c => c.key);
      if (categoryItemIds.includes(id)) {
        setStep(2);
      } else {
        setStep(1);
      }
    }

    setTimeout(() => {
      const el = sectionRefs.current[id];
      if (el) {
        const offset = 120; // More offset for Step 2
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setActiveSection(id);
      }
    }, 100);
  };

  const handleNextStep = () => {
    setStep(2);
    const categoryConfigs = CATEGORY_SECTIONS[initCategory] || [];
    if (categoryConfigs.length > 0) {
      // Small delay to let opacity transition if needed
      setTimeout(() => {
        handleScrollTo(categoryConfigs[0].key, false);
      }, 100);
    }
  };

  // Sidebar items based on category
  const commonItems = [
    { id: 'general', label: 'General Info' },
    { id: 'location', label: 'Location' },
    { id: 'contact', label: 'Contact Person' },
    { id: 'photos', label: 'Photos' },
  ];

  const categoryItems = (CATEGORY_SECTIONS[initCategory] || []).map(c => ({
    id: c.key,
    label: c.label
  }));

  const sidebarItems = step === 1 ? commonItems : categoryItems;

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {/* Step Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <StepBadge 
             step={step} 
             total={2} 
             label={step === 1 ? 'Common Profile Info' : 'Business Specific Details'} 
           />
           {step === 2 && (
             <div className="flex items-center gap-3">
               <button onClick={() => { setStep(1); setTimeout(() => handleScrollTo('general', false), 100); }} className="h-12 px-6 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                 <ArrowLeft size={18} /> Back to Step 1
               </button>
               <button onClick={() => router.push('/home')} className="h-12 px-8 rounded-2xl bg-[#612178] text-white font-bold text-sm shadow-xl shadow-purple-100 hover:bg-[#4d1860] transition-all flex items-center gap-2">
                 <Check size={18} /> Finish Profile
               </button>
             </div>
           )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <Sidebar items={sidebarItems} activeId={activeSection} onScrollTo={handleScrollTo} />

          {/* Main Content */}
          <div className="flex-1 space-y-12 max-w-3xl">
            {/* Mobile Navigation */}
            <div className="lg:hidden sticky top-[0px] z-30 -mx-4 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
               <div className="relative">
                  <select 
                    className="w-full h-11 pl-4 pr-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold appearance-none text-[#612178] focus:outline-none"
                    value={activeSection}
                    onChange={(e) => handleScrollTo(e.target.value)}
                  >
                    {sidebarItems.map(it => <option key={it.id} value={it.id}>{it.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#612178] pointer-events-none" />
               </div>
            </div>

            {/* Step 1 Content Group */}
            <div className={`space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 ${step !== 1 ? 'hidden' : ''}`}>
              <UnifiedCommonProfile
                profile={profile}
                profileDocId={profileDocId}
                userId={user?.id || 0}
                onUpdateProfile={(updated) => setProfile(updated as any)}
                sectionRefs={sectionRefs}
                category={initCategory}
                setCategory={setInitCategory}
                onNext={handleNextStep}
              />
            </div>

            {/* Step 2 Content Group */}
            <div className={`space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 ${step !== 2 ? 'hidden' : ''}`}>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 rounded-full bg-[#612178]" />
                  <h2 className="text-xl font-bold text-gray-900">{CATEGORY_LABELS[initCategory]} Details</h2>
               </div>
              <Step2CategorySections
                profileDocId={profileDocId}
                initialCategory={initCategory}
                sectionRefs={sectionRefs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
