'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { getMyProfile } from '@/lib/profile';
import { uploadKYCWithData, KYCDocumentFiles } from '@/lib/kyc';
import { getProfileData } from '@/lib/auth';

const PURPLE = '#612178';
const PURPLE_LIGHT = '#E0CCF0';
const ORANGE = '#FEA40C';

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-[#545454] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SELECT_WRAPPER = "relative flex items-center";
const SELECT_CHEVRON = "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-10";
const SELECT_BASE = "w-full pl-4 pr-12 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] appearance-none";
const SELECT_BASE_SM = "w-full pl-4 pr-12 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] appearance-none";
const SELECT_COUNTRY_CODE = "min-w-[70px] sm:w-20 pl-3 pr-10 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] shrink-0 appearance-none";

const SIDEBAR_TABS = [
  { id: 'company', label: 'Company Information' },
  { id: 'business', label: 'Business Information' },
  { id: 'kyc', label: 'KYC Verification' },
];

const HOTEL_OPTIONS = ['Hotel', 'Resort', 'Boutique', 'Budget', '5 Star', '4 Star', '3 Star'];
const BUSINESS_TYPE_OPTIONS = ['Restaurant', 'Hotel', 'Taxi Business', 'DMC', 'Tour Guide', 'TT Bus Services', 'Adventure Activity', 'Ayurveda Centre'];
const COUNTRY_OPTIONS = ['India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Other'];
const STATE_OPTIONS = ['Kerala', 'Maharashtra', 'Karnataka', 'Delhi', 'Other'];
const CITY_OPTIONS = ['Kochi', 'Mumbai', 'Bangalore', 'Delhi', 'Dubai', 'Other'];
const DESIGNATION_OPTIONS = ['Manager', 'Director', 'Owner', 'CEO', 'Other'];
const BUSINESS_CATEGORY_OPTIONS = ['Hotel', 'Restaurant', 'DMC', 'Taxi Service', 'Tour Guide', 'Other'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Other'];

const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

function AddAdditionalDetailsContent() {
  const router = useRouter();
  const user = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: 'Hotel',
    roomCount: '24',
    businessCategory: '',
    hotelType: '',
    yearsOfExperience: '',
    findingBusiness: '',
    findingFor: ['Restaurant', 'Hotel', 'DMC', 'Taxi Service'] as string[],
    description: '',
    languages: [] as string[],
    languageInput: '',
    website: '',
    location: '',
    country: '',
    state: '',
    city: '',
    contactPerson: '',
    designation: '',
    email: '',
    countryCode: '+91',
    phone: '',
    yearOfEstablishment: '',
    gstNumber: '',
    panNumber: '',
  });
  const [kycFiles, setKycFiles] = useState<KYCDocumentFiles>({});
  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);

  const businessCardInputRef = useRef<HTMLInputElement | null>(null);
  const companyLicenseInputRef = useRef<HTMLInputElement | null>(null);
  const gstCertificateInputRef = useRef<HTMLInputElement | null>(null);
  const panCopyInputRef = useRef<HTMLInputElement | null>(null);

  const completionPercent = 25;

  useEffect(() => {
    const applyProfile = (p: any) => {
      const rooms = p.rooms_count ?? p.business_details?.number_of_rooms;
      const phoneFirst = Array.isArray(p.phone_numbers) && p.phone_numbers[0] ? p.phone_numbers[0] : '';
      setFormData((prev) => ({
        ...prev,
        companyName: p.company_name || prev.companyName,
        businessType: p.business_type?.[0] || p.business_details?.hotel_type || prev.businessType,
        businessCategory: p.business_type?.[0] || prev.businessCategory,
        hotelType: p.business_details?.hotel_type || prev.hotelType,
        roomCount: String(rooms ?? prev.roomCount),
        description: p.description || prev.description,
        languages: Array.isArray(p.languages) ? p.languages : (prev.languages || []),
        findingFor: Array.isArray(p.preferred_collaborations) && p.preferred_collaborations.length > 0
          ? p.preferred_collaborations
          : prev.findingFor,
        findingBusiness: '',
        website: p.website_link || p.website || prev.website,
        country: p.country || prev.country,
        state: p.state || prev.state,
        city: p.city || prev.city,
        contactPerson: p.contact_person_name || p.contact_person || prev.contactPerson,
        designation: p.designation || prev.designation,
        email: p.email || user?.email || prev.email,
        phone: p.phone || phoneFirst || prev.phone,
      }));
    };
    (async () => {
      if (typeof window !== 'undefined') {
        try {
          const fromPut = sessionStorage.getItem('addAdditionalDetailsProfile');
          if (fromPut) {
            applyProfile(JSON.parse(fromPut));
            sessionStorage.removeItem('addAdditionalDetailsProfile');
            return;
          }
          const fromComplete = sessionStorage.getItem('completeProfileFormData');
          if (fromComplete) {
            applyProfile(JSON.parse(fromComplete));
            sessionStorage.removeItem('completeProfileFormData');
            return;
          }
        } catch { /* ignore */ }
      }
      const cached = typeof window !== 'undefined' ? getProfileData() : null;
      if (cached?.company_name || cached?.business_details) applyProfile(cached);
      if (user?.id) {
        const { exists, profile } = await getMyProfile(user.id);
        if (exists && profile) applyProfile(profile as any);
      }
    })();
  }, [user]);

  const handleCancel = () => {
    router.push('/home');
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (activeTab === 'kyc' && user?.id) {
        const year =
          formData.yearOfEstablishment && !Number.isNaN(Number(formData.yearOfEstablishment))
            ? Number(formData.yearOfEstablishment)
            : undefined;

        const hasCoreData =
          year !== undefined ||
          !!formData.gstNumber ||
          !!formData.panNumber ||
          kycFiles.company_license instanceof File ||
          kycFiles.gst_certificate instanceof File ||
          kycFiles.pan_copy instanceof File;

        if (hasCoreData) {
          await uploadKYCWithData(
            {
              company_license: kycFiles.company_license ?? null,
              gst_certificate: kycFiles.gst_certificate ?? null,
              pan_copy: kycFiles.pan_copy ?? null,
            },
            {
              year_of_establishment: year,
              gst_number: formData.gstNumber || undefined,
              pan_number: formData.panNumber || undefined,
              user_profile: user.id,
            }
          );
        }
      }
    } finally {
      setSaving(false);
      router.push('/home');
    }
  };

  const removeLanguage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== idx),
    }));
  };

  const removeFindingFor = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      findingFor: prev.findingFor.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="flex flex-col min-h-0 flex-1 min-w-0 overflow-x-hidden">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 min-w-0">
        {/* Header - Title, subtitle, Cancel/Save buttons */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-semibold text-gray-900 leading-tight mt-0">Add Additional Details</h1>
            <p className="text-sm text-gray-500 mt-1">This Info will be shown on your public profile</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center h-10 px-5 rounded-[16px] font-semibold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center h-10 px-5 rounded-[16px] font-semibold text-sm text-white transition-colors disabled:opacity-60 w-full sm:w-auto"
              style={{ backgroundColor: PURPLE }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
        <div className="flex flex-1 flex-col lg:flex-row gap-6 w-full min-w-0 overflow-y-auto overflow-x-hidden">
          {/* Left: Profile Completed card */}
        <aside className="w-full lg:w-[260px] shrink-0 mb-6 lg:mb-0 min-w-0 max-w-full">
          <div
            className="rounded-[16px] p-5 w-full max-w-full lg:w-[260px]"
            style={{
              minHeight: 242.14,
              backgroundColor: '#FFFFFF',
              border: '1px solid #D9D9D9',
              boxShadow: '0px 4px 4px 0px #00000040',
            }}
          >
            <p className="font-bold text-gray-900 mb-3">Profile Completed</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path fill="none" stroke="#E5E7EB" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path fill="none" strokeWidth="3" strokeDasharray={`${completionPercent}, 100`} strokeLinecap="round" stroke="#F22822" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#F22822' }}>
                  {completionPercent}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Complete Your Profile To Be Verified</p>
            </div>
            <nav className="space-y-1">
              {SIDEBAR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full text-left px-4 rounded-[8px] text-sm font-semibold transition-all"
                  style={{
                    width: '100%',
                    height: 41.97,
                    backgroundColor: activeTab === tab.id ? '#E7C7F2' : '#FFFFFF',
                    color: '#1F1E25',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right: Main content - Company / Business / KYC */}
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <div
            className={`rounded-[16px] p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-x-hidden ${
              activeTab === 'company' || activeTab === 'business' || activeTab === 'kyc'
                ? ''
                : 'bg-white shadow-sm'
            }`}
            style={
              activeTab === 'company' || activeTab === 'business' || activeTab === 'kyc'
                ? {
                    background: 'linear-gradient(306.38deg, rgba(255, 255, 255, 0.43) 19.03%, rgba(243, 222, 255, 0.3096) 81.81%)',
                    backdropFilter: 'blur(104px)',
                    WebkitBackdropFilter: 'blur(104px)',
                  }
                : undefined
            }
          >
            {activeTab === 'company' && (
              <>
                {/* Combined: Profile + Company Details */}
                <div className="rounded-[16px] overflow-hidden bg-white shadow-sm">
                  <div className="relative h-32 sm:h-40 w-full" style={{ backgroundColor: '#E3BFDD' }}>
                    <button type="button" className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: PURPLE }} aria-label="Edit cover">
                      <Image src="/cover_cameralogo.png" alt="" width={20} height={20} className="object-contain" />
                    </button>
                  </div>
                  <div className="flex justify-start relative -mt-12 pl-4 sm:pl-6">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden z-10 cursor-pointer">
                      <Image src="/profilecamera.png" alt="" width={24} height={24} className="object-contain" />
                    </div>
                  </div>
                  <div className="px-6 sm:px-8 pt-4 pb-6 sm:pb-8 space-y-4">
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Company Name"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={SELECT_WRAPPER}>
                      <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData((p) => ({ ...p, businessType: e.target.value }))}
                        className={SELECT_BASE}
                      >
                        {BUSINESS_TYPE_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={formData.roomCount}
                      onChange={(e) => setFormData((p) => ({ ...p, roomCount: e.target.value }))}
                      placeholder="24 Rooms"
                      className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                    />
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Provide A Description Of Your Company"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] resize-none"
                  />
                  <div>
                    <div className={SELECT_WRAPPER}>
                      <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                      <select
                        value={formData.languageInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !formData.languages.includes(val)) {
                            setFormData((prev) => ({
                              ...prev,
                              languages: [...prev.languages, val],
                              languageInput: '',
                            }));
                          }
                        }}
                        className={SELECT_BASE}
                      >
                        <option value="">Select Languages Preferred</option>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800"
                          >
                            {lang}
                            <button type="button" onClick={() => removeLanguage(i)} className="text-gray-500 hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                    placeholder="Enter Website Link (Optional)"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 font-normal text-base"
                    style={{ color: '#1F1E25' }}
                  >
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: PURPLE }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    Add Social Media Profile
                  </button>
                  </div>
                </div>

                {/* Card 2: Location */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Location</h2>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                        placeholder="Location"
                        className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div>
                      <div className={SELECT_WRAPPER}>
                        <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                          className={SELECT_BASE}
                        >
                          <option value="">Country</option>
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className={SELECT_WRAPPER}>
                          <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                            className={SELECT_BASE}
                          >
                            <option value="">State</option>
                            {STATE_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <div className={SELECT_WRAPPER}>
                          <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                          <select
                            value={formData.city}
                            onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                            className={SELECT_BASE}
                          >
                            <option value="">City</option>
                            {CITY_OPTIONS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Contact Information */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
                        placeholder="Enter The Contact Person"
                        className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                      />
                      <div className={SELECT_WRAPPER}>
                        <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                        <select
                          value={formData.designation}
                          onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                          className={SELECT_BASE}
                        >
                          <option value="">Select Designation</option>
                          {DESIGNATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Abc@gmail.com"
                        className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <div className={`${SELECT_WRAPPER} min-w-[70px] sm:w-20 shrink-0`}>
                        <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData((p) => ({ ...p, countryCode: e.target.value }))}
                          className={SELECT_COUNTRY_CODE}
                          aria-label="Country code"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+971">+971</option>
                          <option value="+44">+44</option>
                        </select>
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="Enter Phone No."
                        aria-label="Phone number"
                        className="flex-1 px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 font-normal text-base"
                      style={{ color: '#1F1E25' }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: PURPLE }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      Add Phone Number
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'business' && (
              <div className="space-y-6">
                {/* Card 1: Upload Business Card + fields */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8">
                  {/* Upload business card */}
                  <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Card</p>
                      <label className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center cursor-pointer">
                        <span
                          className="text-[16px] leading-[24px] font-medium text-[#1F1E25]"
                          style={{ fontFamily: 'var(--font-instrument-sans), sans-serif' }}
                        >
                          Upload
                        </span>
                        <input
                          ref={businessCardInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setBusinessCardFile(file);
                          }}
                        />
                      </label>
                    </div>
                    {businessCardFile && (
                      <div className="w-full max-w-md">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {businessCardFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(businessCardFile.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBusinessCardFile(null);
                              if (businessCardInputRef.current) {
                                businessCardInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className={SELECT_WRAPPER}>
                        <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                        <select
                          value={formData.businessCategory}
                          onChange={(e) => setFormData((p) => ({ ...p, businessCategory: e.target.value }))}
                          className={SELECT_BASE_SM}
                        >
                          <option value="">Business Category</option>
                          {BUSINESS_CATEGORY_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className={SELECT_WRAPPER}>
                          <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                          <select
                            value={formData.hotelType}
                            onChange={(e) => setFormData((p) => ({ ...p, hotelType: e.target.value }))}
                            className={SELECT_BASE_SM}
                          >
                            <option value="">Hotel Type</option>
                            {HOTEL_OPTIONS.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formData.roomCount}
                          onChange={(e) => setFormData((p) => ({ ...p, roomCount: e.target.value }))}
                          placeholder="No. Of Rooms"
                          className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                        placeholder="Years Of Experience (Optional)"
                        className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Business you are finding for */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8">
                  <p className="text-sm font-bold text-gray-900 mb-4">Business You Are Finding For</p>

                  <div className="mb-4">
                    <div className={SELECT_WRAPPER}>
                      <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                      <select
                        value={formData.findingBusiness}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !formData.findingFor.includes(val)) {
                            setFormData((prev) => ({
                              ...prev,
                              findingFor: [...prev.findingFor, val],
                              findingBusiness: '',
                            }));
                          }
                        }}
                        className={SELECT_BASE_SM}
                      >
                        <option value="">Select Business</option>
                        {BUSINESS_CATEGORY_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {formData.findingFor.map((item, idx) => (
                      <span
                        key={`${item}-${idx}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {item}
                        <button type="button" onClick={() => removeFindingFor(idx)} className="text-gray-500 hover:text-gray-900">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-6">
                {/* Card 1: Business Verification */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">Business Verification</p>
                  <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Registration Certificate</p>
                      <label className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center cursor-pointer">
                        <span
                          className="text-[16px] leading-[24px] font-medium text-[#1F1E25]"
                          style={{ fontFamily: 'var(--font-instrument-sans), sans-serif' }}
                        >
                          Upload
                        </span>
                        <input
                          ref={companyLicenseInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setKycFiles(prev => ({ ...prev, company_license: file }));
                          }}
                        />
                      </label>
                    </div>
                    {kycFiles.company_license && (
                      <div className="w-full max-w-md">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {kycFiles.company_license.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(kycFiles.company_license.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setKycFiles(prev => ({ ...prev, company_license: null }));
                              if (companyLicenseInputRef.current) {
                                companyLicenseInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.yearOfEstablishment}
                    onChange={(e) => setFormData((p) => ({ ...p, yearOfEstablishment: e.target.value }))}
                    placeholder="Year Of Establishment"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* Card 2: GST Information */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">GST Information</p>
                  <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Registration Certificate</p>
                      <label className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center cursor-pointer">
                        <span
                          className="text-[16px] leading-[24px] font-medium text-[#1F1E25]"
                          style={{ fontFamily: 'var(--font-instrument-sans), sans-serif' }}
                        >
                          Upload
                        </span>
                        <input
                          ref={gstCertificateInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setKycFiles(prev => ({ ...prev, gst_certificate: file }));
                          }}
                        />
                      </label>
                    </div>
                    {kycFiles.gst_certificate && (
                      <div className="w-full max-w-md">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {kycFiles.gst_certificate.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(kycFiles.gst_certificate.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setKycFiles(prev => ({ ...prev, gst_certificate: null }));
                              if (gstCertificateInputRef.current) {
                                gstCertificateInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, gstNumber: e.target.value }))}
                    placeholder="GST Number"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* Card 3: PAN Information */}
                <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">PAN Information</p>
                  <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload PAN Copy</p>
                      <label className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center cursor-pointer">
                        <span
                          className="text-[16px] leading-[24px] font-medium text-[#1F1E25]"
                          style={{ fontFamily: 'var(--font-instrument-sans), sans-serif' }}
                        >
                          Upload
                        </span>
                        <input
                          ref={panCopyInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setKycFiles(prev => ({ ...prev, pan_copy: file }));
                          }}
                        />
                      </label>
                    </div>
                    {kycFiles.pan_copy && (
                      <div className="w-full max-w-md">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {kycFiles.pan_copy.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(kycFiles.pan_copy.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setKycFiles(prev => ({ ...prev, pan_copy: null }));
                              if (panCopyInputRef.current) {
                                panCopyInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, panNumber: e.target.value }))}
                    placeholder="PAN Number"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* Add Tourism License (Optional) */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 font-normal text-base rounded-2xl px-5 py-3 w-full justify-start bg-white border border-gray-200"
                  style={{ color: '#1F1E25' }}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: PURPLE }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  Add Tourism License (Optional)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default function AddAdditionalDetailsPage() {
  return (
    <ProtectedRoute>
      <AddAdditionalDetailsContent />
    </ProtectedRoute>
  );
}
