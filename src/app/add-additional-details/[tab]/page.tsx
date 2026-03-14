'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useDetails } from '../DetailsContext';
import {
  PURPLE,
  ChevronDownIcon,
  SELECT_WRAPPER,
  SELECT_CHEVRON,
  SELECT_BASE,
  SELECT_BASE_SM,
  SELECT_COUNTRY_CODE,
  HOTEL_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  STATE_OPTIONS,
  CITY_OPTIONS,
  DESIGNATION_OPTIONS,
  BUSINESS_CATEGORY_OPTIONS,
  LANGUAGE_OPTIONS,
  SOCIAL_MEDIA_OPTIONS,
  formatFileSize,
  getSocialMediaPlaceholder
} from '../constants';

export default function TabPage() {
  const {
    activeTab,
    formData,
    setFormData,
    kycFiles,
    setKycFiles,
    socialMediaProfiles,
    setSocialMediaProfiles,
    contacts,
    setContacts,
    showTourismLicense,
    setShowTourismLicense,
    businessCardFile,
    setBusinessCardFile,
    businessCardUrl,
    setBusinessCardUrl,
    kycAttachments,
    coverPhotoUrl,
    setCoverPhotoUrl,
    setCoverPhotoFile,
    profilePhotoUrl,
    setProfilePhotoUrl,
    setProfilePhotoFile,
  } = useDetails();

  const businessCardInputRef = useRef<HTMLInputElement | null>(null);
  const companyLicenseInputRef = useRef<HTMLInputElement | null>(null);
  const gstCertificateInputRef = useRef<HTMLInputElement | null>(null);
  const panCopyInputRef = useRef<HTMLInputElement | null>(null);
  const tourismLicenseInputRef = useRef<HTMLInputElement | null>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialMediaProfile = () => {
    setSocialMediaProfiles((prev) => [...prev, { platform: '', value: '' }]);
  };

  const updateSocialMediaProfile = (index: number, field: 'platform' | 'value', value: string) => {
    setSocialMediaProfiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSocialMediaProfile = (index: number) => {
    setSocialMediaProfiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { name: '', position: '', email: '', countryCode: '+91', phone_number: '' }]);
  };

  const updateContact = (index: number, field: keyof typeof contacts[0], value: string) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
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
    <div className={activeTab === 'company' || activeTab === 'business' || activeTab === 'kyc' ? '' : 'bg-white shadow-sm'}>
      {activeTab === 'company' && (
        <>
          {/* Combined: Profile + Company Details */}
          <div className="rounded-[16px] overflow-hidden bg-white shadow-sm mb-4 sm:mb-6">
            <div className="relative h-32 sm:h-40 w-full overflow-hidden" style={{ backgroundColor: '#E3BFDD' }}>
              {coverPhotoUrl && (
                <img 
                  src={coverPhotoUrl} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              )}
              <input
                ref={coverPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
              />
              <button 
                type="button" 
                onClick={() => coverPhotoInputRef.current?.click()}
                className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden z-10 hover:opacity-90" 
                style={{ backgroundColor: PURPLE }} 
                aria-label="Edit cover"
              >
                <Image src="/cover_cameralogo.png" alt="" width={20} height={20} className="object-contain" />
              </button>
            </div>
            <div className="flex justify-start relative -mt-12 pl-4 sm:pl-6">
              <div 
                className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden z-10 cursor-pointer relative hover:opacity-90"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Image src="/profilecamera.png" alt="" width={24} height={24} className="object-contain" />
                )}
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
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
              {/* Social Media Profiles */}
              {socialMediaProfiles.map((profile, index) => (
                <div key={index} className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
                  <div className={`${SELECT_WRAPPER} min-w-[140px] sm:w-40 shrink-0`}>
                    <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                    <select
                      value={profile.platform}
                      onChange={(e) => updateSocialMediaProfile(index, 'platform', e.target.value)}
                      className={SELECT_BASE}
                      aria-label="Social media platform"
                    >
                      {SOCIAL_MEDIA_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type={profile.platform === 'gmail' ? 'email' : 'url'}
                    value={profile.value}
                    onChange={(e) => updateSocialMediaProfile(index, 'value', e.target.value)}
                    placeholder={getSocialMediaPlaceholder(profile.platform)}
                    aria-label="Social media link or email"
                    className="flex-1 px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialMediaProfile(index)}
                    className="shrink-0 cursor-pointer"
                    aria-label="Remove social media profile"
                  >
                    <Image src="/cancle_symbole.svg" alt="Remove" width={28} height={28} className="w-7 h-7" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialMediaProfile}
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
          <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 mb-4 sm:mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Location/Address"
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
            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={index} className="space-y-4 relative p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove contact"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Enter The Contact Person"
                      className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                    />
                    <div className={SELECT_WRAPPER}>
                      <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                      <select
                        value={contact.position}
                        onChange={(e) => updateContact(index, 'position', e.target.value)}
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
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="Abc@gmail.com"
                      className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <div className={`${SELECT_WRAPPER} min-w-[70px] sm:w-20 shrink-0`}>
                      <span className={SELECT_CHEVRON}><ChevronDownIcon /></span>
                      <select
                        value={contact.countryCode}
                        onChange={(e) => updateContact(index, 'countryCode', e.target.value)}
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
                      value={contact.phone_number}
                      onChange={(e) => updateContact(index, 'phone_number', e.target.value)}
                      placeholder="Enter Phone No."
                      aria-label="Phone number"
                      className="flex-1 px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addContact}
                className="inline-flex items-center gap-2 font-normal text-base"
                style={{ color: '#1F1E25' }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: PURPLE }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add Contact Person
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
              <input
                ref={businessCardInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) setBusinessCardFile(file);
                }}
              />
              {(!businessCardFile && !businessCardUrl) ? (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Card</p>
                  <button
                    type="button"
                    onClick={() => businessCardInputRef.current?.click()}
                    className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center cursor-pointer hover:bg-[#e8960b] transition-colors mx-auto"
                  >
                    <span
                      className="text-[16px] leading-[24px] font-medium text-[#1F1E25]"
                      style={{ fontFamily: 'var(--font-instrument-sans), sans-serif' }}
                    >
                      Upload
                    </span>
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  {businessCardFile ? (
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
                        aria-label="Remove new file"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="relative group w-full">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img 
                          src={businessCardUrl || ''} 
                          alt="Business Card" 
                          className="w-full h-auto max-h-[160px] object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => businessCardInputRef.current?.click()}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-[#612178] transition-colors z-10"
                          aria-label="Edit / Change"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.businessCategory}
                  onChange={(e) => setFormData((p) => ({ ...p, businessCategory: e.target.value }))}
                  placeholder="Business Category"
                  className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.businessSubCategory}
                    onChange={(e) => setFormData((p) => ({ ...p, businessSubCategory: e.target.value }))}
                    placeholder="Business Sub Category"
                    className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData((p) => ({ ...p, additionalInfo: e.target.value }))}
                    placeholder="Additional Info"
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
          {/* Card 1: Business Registration */}
          {(() => {
            const existing = kycAttachments.find(a => a.document_type === 'company_license');
            return (
              <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                <p className="text-base font-bold text-gray-900">Business Verification</p>
                <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
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
                  {kycFiles.company_license ? (
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{kycFiles.company_license.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(kycFiles.company_license.size)}</p>
                        </div>
                        <button type="button" onClick={() => { setKycFiles(prev => ({ ...prev, company_license: null })); if (companyLicenseInputRef.current) companyLicenseInputRef.current.value = ''; }} className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200" aria-label="Remove file">×</button>
                      </div>
                    </div>
                  ) : existing ? (
                    <div className="w-full max-w-md">
                      <div className="relative flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <a href={existing.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#612178] truncate hover:underline block">{existing.name}</a>
                          {existing.size && <p className="text-xs text-gray-500">{formatFileSize(existing.size)}</p>}
                        </div>
                        <button type="button" onClick={() => companyLicenseInputRef.current?.click()} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-[#612178] transition-colors" aria-label="Replace file">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload Business Registration Certificate</p>
                      <button type="button" onClick={() => companyLicenseInputRef.current?.click()} className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center hover:bg-[#e8960b] transition-colors mx-auto">
                        <span className="text-[16px] leading-[24px] font-medium text-[#1F1E25]">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
                <input type="text" value={formData.yearOfEstablishment} onChange={(e) => setFormData((p) => ({ ...p, yearOfEstablishment: e.target.value }))} placeholder="Year Of Establishment" className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]" />
              </div>
            );
          })()}

          {/* Card 2: GST Information */}
          {(() => {
            const existing = kycAttachments.find(a => a.document_type === 'gst_certificate');
            return (
              <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                <p className="text-base font-bold text-gray-900">GST Information</p>
                <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
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
                  {kycFiles.gst_certificate ? (
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{kycFiles.gst_certificate.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(kycFiles.gst_certificate.size)}</p>
                        </div>
                        <button type="button" onClick={() => { setKycFiles(prev => ({ ...prev, gst_certificate: null })); if (gstCertificateInputRef.current) gstCertificateInputRef.current.value = ''; }} className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200" aria-label="Remove file">×</button>
                      </div>
                    </div>
                  ) : existing ? (
                    <div className="w-full max-w-md">
                      <div className="relative flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <a href={existing.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#612178] truncate hover:underline block">{existing.name}</a>
                          {existing.size && <p className="text-xs text-gray-500">{formatFileSize(existing.size)}</p>}
                        </div>
                        <button type="button" onClick={() => gstCertificateInputRef.current?.click()} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-[#612178] transition-colors" aria-label="Replace file">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload GST Certificate</p>
                      <button type="button" onClick={() => gstCertificateInputRef.current?.click()} className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center hover:bg-[#e8960b] transition-colors mx-auto">
                        <span className="text-[16px] leading-[24px] font-medium text-[#1F1E25]">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
                <input type="text" value={formData.gstNumber} onChange={(e) => setFormData((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST Number" className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]" />
              </div>
            );
          })()}

          {/* Card 3: PAN Information */}
          {(() => {
            const existing = kycAttachments.find(a => a.document_type === 'pan_copy');
            return (
              <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                <p className="text-base font-bold text-gray-900">PAN Information</p>
                <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
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
                  {kycFiles.pan_copy ? (
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{kycFiles.pan_copy.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(kycFiles.pan_copy.size)}</p>
                        </div>
                        <button type="button" onClick={() => { setKycFiles(prev => ({ ...prev, pan_copy: null })); if (panCopyInputRef.current) panCopyInputRef.current.value = ''; }} className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200" aria-label="Remove file">×</button>
                      </div>
                    </div>
                  ) : existing ? (
                    <div className="w-full max-w-md">
                      <div className="relative flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <a href={existing.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#612178] truncate hover:underline block">{existing.name}</a>
                          {existing.size && <p className="text-xs text-gray-500">{formatFileSize(existing.size)}</p>}
                        </div>
                        <button type="button" onClick={() => panCopyInputRef.current?.click()} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-[#612178] transition-colors" aria-label="Replace file">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload PAN Copy</p>
                      <button type="button" onClick={() => panCopyInputRef.current?.click()} className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center hover:bg-[#e8960b] transition-colors mx-auto">
                        <span className="text-[16px] leading-[24px] font-medium text-[#1F1E25]">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
                <input type="text" value={formData.panNumber} onChange={(e) => setFormData((p) => ({ ...p, panNumber: e.target.value }))} placeholder="PAN Number" className="w-full px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] placeholder-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178]" />
              </div>
            );
          })()}

          {/* Tourism License (Optional) */}
          {(() => {
            const existing = kycAttachments.find(a => a.document_type === 'tourism_license');
            return !showTourismLicense && !existing ? (
              <button
                type="button"
                onClick={() => setShowTourismLicense(true)}
                className="inline-flex items-center gap-2 font-normal text-base rounded-2xl px-5 py-3 w-full justify-start bg-white border border-gray-200"
                style={{ color: '#1F1E25' }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: PURPLE }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </span>
                Add Tourism License (Optional)
              </button>
            ) : (
              <div className="bg-white rounded-[16px] shadow-sm p-6 sm:p-8 space-y-4">
                <p className="text-base font-bold text-gray-900">Tourism License</p>
                <div className="border-2 border-dashed rounded-[8px] border-[#696969] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4">
                  <input
                    ref={tourismLicenseInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setKycFiles(prev => ({ ...prev, tourism_license: file }));
                    }}
                  />
                  {kycFiles.tourism_license ? (
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{kycFiles.tourism_license.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(kycFiles.tourism_license.size)}</p>
                        </div>
                        <button type="button" onClick={() => { setKycFiles(prev => ({ ...prev, tourism_license: null })); if (tourismLicenseInputRef.current) tourismLicenseInputRef.current.value = ''; }} className="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200" aria-label="Remove file">×</button>
                      </div>
                    </div>
                  ) : existing ? (
                    <div className="w-full max-w-md">
                      <div className="relative flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <a href={existing.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#612178] truncate hover:underline block">{existing.name}</a>
                          {existing.size && <p className="text-xs text-gray-500">{formatFileSize(existing.size)}</p>}
                        </div>
                        <button type="button" onClick={() => tourismLicenseInputRef.current?.click()} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-[#612178] transition-colors" aria-label="Replace file">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Upload Tourism License</p>
                      <button type="button" onClick={() => tourismLicenseInputRef.current?.click()} className="w-[122px] h-[43px] rounded-[16px] bg-[#FEA40C] flex items-center justify-center hover:bg-[#e8960b] transition-colors mx-auto">
                        <span className="text-[16px] leading-[24px] font-medium text-[#1F1E25]">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
