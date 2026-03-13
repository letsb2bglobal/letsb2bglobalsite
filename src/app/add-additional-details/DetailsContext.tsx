'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/ProtectedRoute';
import { getMyProfile, UserProfile, updateUserProfileById } from '@/lib/profile';
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
  location: string;
  country: string;
  state: string;
  city: string;
  contactPerson: string;
  designation: string;
  email: string;
  countryCode: string;
  phone: string;
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
  additionalPhones: { countryCode: string; phone: string }[];
  setAdditionalPhones: React.Dispatch<React.SetStateAction<{ countryCode: string; phone: string }[]>>;
  kycAttachments: { document_type: string; url: string; name: string; size?: number }[];
  setKycAttachments: React.Dispatch<React.SetStateAction<{ document_type: string; url: string; name: string; size?: number }[]>>;
  socialMediaProfiles: { platform: string; value: string }[];
  setSocialMediaProfiles: React.Dispatch<React.SetStateAction<{ platform: string; value: string }[]>>;
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
    tourismLicenseNumber: '',
  });
  
  const [kycFiles, setKycFiles] = useState<KYCDocumentFiles>({});
  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);
  const [businessCardUrl, setBusinessCardUrl] = useState<string | null>(null);
  const [kycAttachments, setKycAttachments] = useState<{ document_type: string; url: string; name: string; size?: number }[]>([]);
  const [additionalPhones, setAdditionalPhones] = useState<{ countryCode: string; phone: string }[]>([]);
  const [showTourismLicense, setShowTourismLicense] = useState(false);
  const [socialMediaProfiles, setSocialMediaProfiles] = useState<{ platform: string; value: string }[]>([]);

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
      if (activeTab === 'company' && profile?.id) {
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
          contact_person_name: formData.contactPerson,
          designation: formData.designation,
          email: formData.email,
          phone_numbers: [
            formData.phone,
            ...additionalPhones.map(p => p.phone).filter(Boolean)
          ],
          social_links: socialMediaProfiles,
        };
        await updateUserProfileById(profile.id, payload);

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
        additionalPhones,
        setAdditionalPhones,
        socialMediaProfiles,
        setSocialMediaProfiles,
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
