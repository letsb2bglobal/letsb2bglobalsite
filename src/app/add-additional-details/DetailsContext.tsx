'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/ProtectedRoute';
import { getMyProfile, getFullProfile, UserProfile, updateUserProfileById, updateUserProfile } from '@/lib/profile';
import { uploadKYCWithData, KYCDocumentFiles, getKycInfo } from '@/lib/kyc';
import { getProfileData } from '@/lib/auth';
import { getBusinessInfo, submitBusinessInfo } from '@/lib/business';

interface FormData {
  companyName: string;
  businessType: string;
  roomCount: string;
  businessCategory: string;
  businessSubCategory: string;
  additionalInfo: string;
  hotelType: string;
  yearsOfExperience: string;
  findingBusiness: string;
  findingFor: string[];
  description: string;
  languages: string[];
  languageInput: string;
  website: string;
  address: string;
  country: string;
  state: string;
  city: string;
  yearOfEstablishment: string;
  gstNumber: string;
  panNumber: string;
  tourismLicenseNumber: string;
}

interface DetailsContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  kycFiles: KYCDocumentFiles;
  setKycFiles: React.Dispatch<React.SetStateAction<KYCDocumentFiles>>;
  businessCardFile: File | null;
  setBusinessCardFile: React.Dispatch<React.SetStateAction<File | null>>;
  businessCardUrl: string | null;
  setBusinessCardUrl: React.Dispatch<React.SetStateAction<string | null>>;
  contacts: { name: string; position: string; email: string; countryCode: string; phone_number: string }[];
  setContacts: React.Dispatch<React.SetStateAction<{ name: string; position: string; email: string; countryCode: string; phone_number: string }[]>>;
  kycAttachments: { document_type: string; url: string; name: string; size?: number }[];
  setKycAttachments: React.Dispatch<React.SetStateAction<{ document_type: string; url: string; name: string; size?: number }[]>>;
  socialMediaProfiles: { platform: string; value: string }[];
  setSocialMediaProfiles: React.Dispatch<React.SetStateAction<{ platform: string; value: string }[]>>;
  coverPhotoFile: File | null;
  setCoverPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  coverPhotoUrl: string | null;
  setCoverPhotoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  profilePhotoFile: File | null;
  setProfilePhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  profilePhotoUrl: string | null;
  setProfilePhotoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  showTourismLicense: boolean;
  setShowTourismLicense: React.Dispatch<React.SetStateAction<boolean>>;
  saving: boolean;
  loading: boolean;
  activeTab: string;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  completionPercent: number;
}

const DetailsContext = createContext<DetailsContextType | undefined>(undefined);

export function DetailsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const user = useAuth();
  
  const tabParam = params?.tab as string;
  const activeTab = tabParam || 'company';

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    businessType: 'Hotel',
    roomCount: '24',
    businessCategory: '',
    businessSubCategory: '',
    additionalInfo: '',
    hotelType: '',
    yearsOfExperience: '',
    findingBusiness: '',
    findingFor: ['Restaurant', 'Hotel', 'DMC', 'Taxi Service'],
    description: '',
    languages: [],
    languageInput: '',
    website: '',
    address: '',
    country: '',
    state: '',
    city: '',
    yearOfEstablishment: '',
    gstNumber: '',
    panNumber: '',
    tourismLicenseNumber: '',
  });
  
  const [kycFiles, setKycFiles] = useState<KYCDocumentFiles>({});
  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);
  const [businessCardUrl, setBusinessCardUrl] = useState<string | null>(null);
  const [kycAttachments, setKycAttachments] = useState<{ document_type: string; url: string; name: string; size?: number }[]>([]);
  const [contacts, setContacts] = useState<{ name: string; position: string; email: string; countryCode: string; phone_number: string }[]>([
    { name: '', position: '', email: '', countryCode: '+91', phone_number: '' }
  ]);
  const [showTourismLicense, setShowTourismLicense] = useState(false);
  const [socialMediaProfiles, setSocialMediaProfiles] = useState<{ platform: string; value: string }[]>([]);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

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
        address: p.address || p.location || prev.address,
        country: p.country || prev.country,
        state: p.state || prev.state,
        city: p.city || prev.city,
      }));

      // Extract image URLs if available
      if (p.profile_image?.url) {
        setProfilePhotoUrl(p.profile_image.url);
      }
      if (p.header_image?.url) {
        setCoverPhotoUrl(p.header_image.url);
      } else if (p.cover_photo?.url) {
        setCoverPhotoUrl(p.cover_photo.url);
      }

      // Auto-fill contacts if present
      const contactPersons = p.contact_person_name || p.contact_person;
      if (Array.isArray(contactPersons) && contactPersons.length > 0) {
        setContacts(
          contactPersons.map((c: any) => {
            const hasStrCode = typeof c.phone_number === 'string' && c.phone_number.includes('-');
            const split = hasStrCode ? c.phone_number.split('-') : [];
            const parsedCode = split.length > 1 ? split[0] : '+91';
            const parsedNum = split.length > 1 ? split.slice(1).join('-') : c.phone_number;
            return {
              name: c.name || '',
              position: c.position || c.designation || '',
              email: c.email || '',
              countryCode: parsedCode || '+91',
              phone_number: parsedNum || '',
            };
          })
        );
      } else if (typeof contactPersons === 'string' || p.email || phoneFirst) {
        setContacts([
          {
            name: (typeof contactPersons === 'string' ? contactPersons : '') || '',
            position: p.designation || '',
            email: p.email || user?.email || '',
            countryCode: p.countryCode || '+91',
            phone_number: p.phone || phoneFirst || '',
          },
        ]);
      }

      // Auto-fill social links if present
      if (Array.isArray(p.social_links) && p.social_links.length > 0) {
        setSocialMediaProfiles(p.social_links);
      } else if (p.social_links && typeof p.social_links === 'object') {
         // handle object syntax if that's what backend returns
         const links = Object.keys(p.social_links).map(key => ({
            platform: key,
            value: p.social_links[key]
         }));
         setSocialMediaProfiles(links);
      }
    };
    
    const applyBusinessInfo = (bi: any) => {
      setFormData((prev) => ({
        ...prev,
        businessCategory: bi.businessCategory || prev.businessCategory,
        businessSubCategory: bi.businessSubCategory || prev.businessSubCategory,
        additionalInfo: bi.additionalInfo || prev.additionalInfo,
        yearsOfExperience: bi.yearsOfExperience ? String(bi.yearsOfExperience) : prev.yearsOfExperience,
        findingFor: Array.isArray(bi.businessYouAreFindingFor) && bi.businessYouAreFindingFor.length > 0
          ? bi.businessYouAreFindingFor
          : prev.findingFor,
      }));
      if (bi.businessCard) {
        setBusinessCardUrl(bi.businessCard);
      }
    };

    const applyKycInfo = (ki: any) => {
      setFormData((prev) => ({
        ...prev,
        gstNumber: ki.gst_number || prev.gstNumber,
        panNumber: ki.pan_number || prev.panNumber,
        yearOfEstablishment: ki.year_of_establishment ? String(ki.year_of_establishment) : prev.yearOfEstablishment,
      }));
      // Store typed attachments so UI can show them per section
      if (Array.isArray(ki.custom_attachments) && ki.custom_attachments.length > 0) {
        setKycAttachments(
          ki.custom_attachments.map((a: any) => ({
            document_type: a.document_type || '',
            url: a.url || '',
            name: a.name || '',
            size: a.size,
          }))
        );
      }
    };
    
    (async () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined') {
          try {
            const fromPut = sessionStorage.getItem('addAdditionalDetailsProfile');
            if (fromPut) {
              applyProfile(JSON.parse(fromPut));
              sessionStorage.removeItem('addAdditionalDetailsProfile');
              setLoading(false);
              return;
            }
            const fromComplete = sessionStorage.getItem('completeProfileFormData');
            if (fromComplete) {
              applyProfile(JSON.parse(fromComplete));
              sessionStorage.removeItem('completeProfileFormData');
              setLoading(false);
              return;
            }
          } catch { /* ignore */ }
        }
        const cached = typeof window !== 'undefined' ? getProfileData() : null;
        if (cached?.company_name || cached?.business_details) applyProfile(cached);
        if (user?.id) {
          const { exists, profile: p } = await getMyProfile(user.id);
          if (exists && p) {
            setProfile(p);
            applyProfile(p as any);
            
            if (p.documentId) {
              const fullProfile = await getFullProfile(p.documentId);
              if (fullProfile) {
                applyProfile(fullProfile);
              }

              const bi = await getBusinessInfo(p.documentId);
              if (bi) applyBusinessInfo(bi);

              const ki = await getKycInfo(p.documentId);
              if (ki) applyKycInfo(ki);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCancel = () => {
    router.push('/home');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'company' && profile?.documentId) {
        const payload = {
          company_name: formData.companyName,
          business_type: [formData.businessType],
          rooms_count: !isNaN(Number(formData.roomCount)) ? Number(formData.roomCount) : 0,
          description: formData.description,
          languages: formData.languages,
          website_link: formData.website,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          contact_person_name: contacts.map(c => ({
            name: c.name,
            position: c.position,
            email: c.email,
            phone_number: c.phone_number ? (c.countryCode && c.countryCode !== '' ? `${c.countryCode}-${c.phone_number}` : c.phone_number) : ''
          })),
          phone_numbers: contacts.map(c => c.phone_number).filter(Boolean),
          social_links: socialMediaProfiles,
        };
        await updateUserProfile(profile.documentId, payload as any, {
          profile_image: profilePhotoFile || undefined,
          header_image: coverPhotoFile || undefined
        });

      } else if (activeTab === 'kyc' && profile?.documentId) {
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
          kycFiles.pan_copy instanceof File ||
          kycFiles.tourism_license instanceof File;

        if (hasCoreData) {
          await uploadKYCWithData(
            profile.documentId,
            {
              company_license: kycFiles.company_license ?? null,
              gst_certificate: kycFiles.gst_certificate ?? null,
              pan_copy: kycFiles.pan_copy ?? null,
              tourism_license: kycFiles.tourism_license ?? null,
            },
            {
              year_of_establishment: year,
              gst_number: formData.gstNumber || undefined,
              pan_number: formData.panNumber || undefined,
            }
          );
        }
      } else if (activeTab === 'business' && profile?.documentId) {
        const years = !isNaN(Number(formData.yearsOfExperience)) 
          ? Number(formData.yearsOfExperience) 
          : 0;

        await submitBusinessInfo(
          profile.documentId,
          {
            businessCategory: formData.businessCategory,
            businessSubCategory: formData.businessSubCategory,
            yearsOfExperience: years,
            additionalInfo: formData.additionalInfo,
            businessYouAreFindingFor: formData.findingFor,
          },
          businessCardFile
        );
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setSaving(false);
      router.push('/home');
    }
  };

  return (
    <DetailsContext.Provider
      value={{
        formData,
        setFormData,
        kycFiles,
        setKycFiles,
        businessCardFile,
        setBusinessCardFile,
        businessCardUrl,
        setBusinessCardUrl,
        kycAttachments,
        setKycAttachments,
        contacts,
        setContacts,
        socialMediaProfiles,
        setSocialMediaProfiles,
        coverPhotoFile,
        setCoverPhotoFile,
        coverPhotoUrl,
        setCoverPhotoUrl,
        profilePhotoFile,
        setProfilePhotoFile,
        profilePhotoUrl,
        setProfilePhotoUrl,
        showTourismLicense,
        setShowTourismLicense,
        saving,
        loading,
        activeTab,
        handleSave,
        handleCancel,
        completionPercent,
      }}
    >
      {children}
    </DetailsContext.Provider>
  );
}

export function useDetails() {
  const context = useContext(DetailsContext);
  if (context === undefined) {
    throw new Error('useDetails must be used within a DetailsProvider');
  }
  return context;
}
