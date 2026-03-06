'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { getMyProfile } from '@/lib/profile';

const PURPLE = '#612178';
const PURPLE_LIGHT = '#E0CCF0';
const ORANGE = '#FEA40C';

const SIDEBAR_TABS = [
  { id: 'company', label: 'Company Information' },
  { id: 'business', label: 'Business Information' },
  { id: 'kyc', label: 'KYC Verification' },
];

const HOTEL_OPTIONS = ['Hotel', 'Resort', 'Boutique', 'Budget', '5 Star', '4 Star', '3 Star'];
const COUNTRY_OPTIONS = ['India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Other'];
const STATE_OPTIONS = ['Kerala', 'Maharashtra', 'Karnataka', 'Delhi', 'Other'];
const CITY_OPTIONS = ['Kochi', 'Mumbai', 'Bangalore', 'Delhi', 'Dubai', 'Other'];
const DESIGNATION_OPTIONS = ['Manager', 'Director', 'Owner', 'CEO', 'Other'];
const BUSINESS_CATEGORY_OPTIONS = ['Hotel', 'Restaurant', 'DMC', 'Taxi Service', 'Tour Guide', 'Other'];

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

  const completionPercent = 25;

  useEffect(() => {
    if (user?.id) {
      getMyProfile(user.id).then(({ exists, profile }) => {
        if (exists && profile) {
          const p = profile as any;
          setFormData((prev) => ({
            ...prev,
            companyName: p.company_name || prev.companyName,
            businessType: p.business_details?.hotel_type || prev.businessType,
            roomCount: String(p.business_details?.number_of_rooms ?? prev.roomCount),
            email: p.email || user?.email || prev.email,
          }));
        }
      });
    }
  }, [user]);

  const handleCancel = () => {
    router.push('/complete-profile');
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: wire to profile API
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    router.push('/complete-profile');
  };

  const addLanguage = () => {
    const val = formData.languageInput.trim();
    if (val && !formData.languages.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, val],
        languageInput: '',
      }));
    }
  };

  const removeLanguage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== idx),
    }));
  };

  const addFindingFor = () => {
    const val = formData.findingBusiness.trim();
    if (val && !formData.findingFor.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        findingFor: [...prev.findingFor, val],
        findingBusiness: '',
      }));
    }
  };

  const removeFindingFor = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      findingFor: prev.findingFor.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Title bar - above Profile Completed per Figma */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Additional Details</h1>
            <p className="text-sm text-gray-600 mt-0.5">This Info will be shown on your public profile</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: PURPLE }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <div className="flex flex-1 gap-0 lg:gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-auto">
          {/* Left sidebar */}
        <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: PURPLE_LIGHT }}
          >
            <p className="font-bold text-gray-900 mb-3">Profile Completed</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path fill="none" stroke="#E5E7EB" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path fill="none" strokeWidth="3" strokeDasharray={`${completionPercent}, 100`} strokeLinecap="round" stroke={PURPLE} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: PURPLE }}>
                  {completionPercent}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Complete Your Profile To Be Verified</p>
            </div>
          </div>
          <nav className="space-y-1">
            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={
                  activeTab === tab.id
                    ? { backgroundColor: PURPLE, color: 'white' }
                    : { backgroundColor: PURPLE_LIGHT, color: PURPLE }
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-8">
            {activeTab === 'company' && (
              <>
                {/* Profile picture upload */}
                <div
                  className="w-full aspect-[3/1] min-h-[120px] rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors hover:opacity-90"
                  style={{ backgroundColor: PURPLE_LIGHT, borderColor: PURPLE_LIGHT }}
                >
                  <Image src="/profilecamera.png" alt="" width={48} height={48} className="opacity-70" />
                </div>

                {/* Company Details */}
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-4">Company Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                        placeholder="Lorem Ipsum"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData((p) => ({ ...p, businessType: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                        >
                          {HOTEL_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rooms</label>
                        <select
                          value={formData.roomCount}
                          onChange={(e) => setFormData((p) => ({ ...p, roomCount: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                        >
                          {['24', '12', '36', '50', '100'].map((n) => (
                            <option key={n} value={n}>{n} Rooms</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Provide A Description Of Your Company</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        rows={4}
                        placeholder="Enter description..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Languages Preferred</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={formData.languageInput}
                          onChange={(e) => setFormData((p) => ({ ...p, languageInput: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                          placeholder="Add language"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                        />
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                          style={{ backgroundColor: PURPLE }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      {formData.languages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Website Link (Optional)</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                        placeholder="https://"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PURPLE }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      Add Social Media Profile
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-4">Location</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                        placeholder="Enter location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                      >
                        <option value="">Select Country</option>
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                        >
                          <option value="">Select State</option>
                          {STATE_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                        >
                          <option value="">Select City</option>
                          {CITY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter The Contact Person</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
                        placeholder="Contact person name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Designation</label>
                      <select
                        value={formData.designation}
                        onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                      >
                        <option value="">Select Designation</option>
                        {DESIGNATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Abc@gmail.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData((p) => ({ ...p, countryCode: e.target.value }))}
                        className="w-20 px-3 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+971">+971</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="Enter Phone No."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PURPLE }}>
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
                {/* Business information card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                  {/* Upload business card */}
                  <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Card</p>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full font-semibold text-sm text-white"
                      style={{ backgroundColor: ORANGE }}
                    >
                      Upload
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <select
                        value={formData.businessCategory}
                        onChange={(e) => setFormData((p) => ({ ...p, businessCategory: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                      >
                        <option value="">Business Category</option>
                        {BUSINESS_CATEGORY_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <select
                          value={formData.hotelType}
                          onChange={(e) => setFormData((p) => ({ ...p, hotelType: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                        >
                          <option value="">Hotel Type</option>
                          {HOTEL_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formData.roomCount}
                          onChange={(e) => setFormData((p) => ({ ...p, roomCount: e.target.value }))}
                          placeholder="No. Of Rooms"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                        placeholder="Years Of Experience (Optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                      />
                    </div>
                  </div>
                </div>

                {/* Business you are finding for */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                  <p className="text-sm font-bold text-gray-900 mb-4">Business You Are Finding For</p>

                  <div className="flex items-center gap-3 mb-4">
                    <select
                      value={formData.findingBusiness}
                      onChange={(e) => setFormData((p) => ({ ...p, findingBusiness: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#612178]"
                    >
                      <option value="">Select Business</option>
                      {BUSINESS_CATEGORY_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addFindingFor}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: PURPLE }}
                      aria-label="Add business"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
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
                {/* Business Verification */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">Business Verification</p>
                  <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Registration Certificate</p>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full font-semibold text-sm text-white"
                      style={{ backgroundColor: ORANGE }}
                    >
                      Upload
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.yearOfEstablishment}
                    onChange={(e) => setFormData((p) => ({ ...p, yearOfEstablishment: e.target.value }))}
                    placeholder="Year Of Establishment"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* GST Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">GST Information</p>
                  <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Registration Certificate</p>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full font-semibold text-sm text-white"
                      style={{ backgroundColor: ORANGE }}
                    >
                      Upload
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, gstNumber: e.target.value }))}
                    placeholder="GST Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* PAN Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4">
                  <p className="text-base font-bold text-gray-900">PAN Information</p>
                  <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-600 mb-3">Upload PAN Copy</p>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full font-semibold text-sm text-white"
                      style={{ backgroundColor: ORANGE }}
                    >
                      Upload
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, panNumber: e.target.value }))}
                    placeholder="PAN Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#612178]"
                  />
                </div>

                {/* Add Tourism License (Optional) */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PURPLE }}>
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
  );
}

export default function AddAdditionalDetailsPage() {
  return (
    <ProtectedRoute>
      <AddAdditionalDetailsContent />
    </ProtectedRoute>
  );
}
