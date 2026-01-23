'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthLayout from '@/components/AuthLayout';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    isBusinessType: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fullName: formData.fullName,
      //     email: formData.email,
      //     password: formData.password,
      //     businessType: formData.isBusinessType
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Handle actual response
      // if (response.ok) {
      //   const data = await response.json();
      //   // Store token, redirect, etc.
      //   router.push('/dashboard');
      // } else {
      //   const error = await response.json();
      //   setSubmitError(error.message || 'Registration failed');
      // }
      
      // For now, just redirect on success
      router.push('/dashboard');
      
    } catch (error) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logoText = "LET'S B2B";
  const subLogoText = "GLOBAL";

  return (
    <AuthLayout>
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <Image 
          src="/images/logo.png" 
          alt="Company Logo" 
          width={120} 
          height={48}
          className="object-contain mr-3"
        />
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-[#1e293b] tracking-tight">{logoText}</span>
          <span className="text-[10px] tracking-[0.4em] text-[#94a3b8] -mt-1">{subLogoText}</span>
        </div>
      </div>

      {/* Header - Fixed Height */}
      <div className="text-center mb-8" style={{ minHeight: '80px' }}>
        <h2 className="text-2xl font-semibold text-[#1e293b] mb-2">SignUp</h2>
        <p className="text-sm text-[#64748b] text-center">
          Lorem Ipsum is simply dummy text of the printing
        </p>
      </div>

      {/* Form - Takes remaining space */}
      <form className="w-full space-y-4 flex-1" onSubmit={handleSubmit}>
        <div className="relative">
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name" 
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.fullName ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>
        <div className="relative">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email" 
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.email ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="relative">
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password" 
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
              errors.password ? 'border-red-500' : 'border-[#e2e8f0]'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {submitError}
          </div>
        )}

        {/* Checkbox */}
        <div className="flex items-center pt-2">
          <input 
            type="checkbox" 
            name="isBusinessType"
            checked={formData.isBusinessType}
            onChange={handleInputChange}
            id="business-type" 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="business-type" className="ml-2 text-xs text-gray-700">
            Are you a Hotel, DMC, Event Management
          </label>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#eff6ff] text-[#1e293b] font-bold text-sm rounded-md hover:bg-blue-100 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registering...' : 'REGISTER'}
        </button>
      </form>

      {/* Footer - Fixed Height */}
      <div className="mt-8 text-sm text-gray-600 text-center">
        Already have an account? <a href="/aboutus/signin" className="text-black font-bold hover:underline">Login</a>
      </div>
    </AuthLayout>
  );
}
