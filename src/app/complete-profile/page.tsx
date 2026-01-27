'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/ProtectedRoute';
import { createUserProfile, type CreateProfileData } from '@/lib/profile';
import AuthLayout from '@/components/AuthLayout';
import Image from 'next/image';

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  
  const [formData, setFormData] = useState<CreateProfileData>({
    company_name: '',
    user_type: 'seller',
    category: '',
    country: '',
    city: '',
    website: '',
    whatsapp: '',
    userId: user?.id || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (formData.whatsapp && !/^\+?[1-9]\d{1,14}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = 'Invalid WhatsApp number format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user?.id) {
      setSubmitError('User not authenticated');
      return;
    }
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      // Create the profile
      await createUserProfile({
        ...formData,
        userId: user.id,
      });
      
      // Redirect to home or company profile page
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      
    } catch (error) {
      console.error('Profile creation error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logoText = "LET'S B2B";
  const subLogoText = "GLOBAL";

  return (
    <AuthLayout>
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <Image 
          src="/images/logo.png" 
          alt="Company Logo" 
          width={100} 
          height={40}
          className="object-contain mr-3"
        />
        <div className="flex flex-col">
          <span className="text-xl tracking-tight text-[#1e293b]">
            <span className="font-normal">LET'S</span>{' '}
            <span className="font-bold">B2B</span>
          </span>
          <span className="text-[10px] tracking-[0.4em] text-[#94a3b8] -mt-1">{subLogoText}</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#1e293b] mb-2">Complete Your Profile</h2>
        <p className="text-sm text-[#64748b]">
          Please provide your company details to continue
        </p>
      </div>

      {/* Form */}
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            placeholder="Company Name *"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.company_name ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.company_name && (
            <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
          )}
        </div>

        <div className="relative">
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
          >
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Category (e.g., DMC, Hotel, Tour Operator) *"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.category ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country *"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
                errors.country ? 'border-red-500' : 'border-[#e2e8f0]'
              }`}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City *"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
                errors.city ? 'border-red-500' : 'border-[#e2e8f0]'
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="Website (optional)"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.website ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">{errors.website}</p>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="WhatsApp Number (optional)"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.whatsapp ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.whatsapp && (
            <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#eff6ff] text-[#1e293b] font-bold text-sm rounded-md hover:bg-blue-100 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Profile...' : 'COMPLETE PROFILE'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
