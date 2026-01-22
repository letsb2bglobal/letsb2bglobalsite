'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="flex min-h-screen w-full font-sans bg-white">
      {/* Left Section */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#f4f5f7] p-12">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-64 h-48 bg-[#cbd5e0] rounded-sm flex items-center justify-center relative overflow-hidden mb-12">
             {/* Placeholder Image Icon Style */}
             <svg width="100%" height="100%" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="150" fill="#CBD5E0"/>
                <circle cx="70" cy="50" r="8" fill="white"/>
                <path d="M0 150L60 90L100 120L160 60L200 100V150H0Z" fill="white" fillOpacity="0.6"/>
             </svg>
          </div>
          <button className="w-full bg-[#0066ff] hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-md transition-colors text-xl">
            List Your Business
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <div className="relative mr-3">
               <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 20L80 50L30 80V20Z" fill="#0066ff" />
                <circle cx="20" cy="30" r="4" fill="#0066ff" />
                <circle cx="15" cy="45" r="4" fill="#0066ff" />
                <rect x="18" y="55" width="8" height="8" fill="#ff6600" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800 leading-none">{logoText}</h1>
              <span className="text-[10px] tracking-[0.3em] text-gray-400 mt-1 text-center">{subLogoText}</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">SignUp</h2>
            <p className="text-sm text-gray-500">Lorem Ipsum is simply dummy text of the printing</p>
          </div>

          {/* Form Fields */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name" 
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-200'
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
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
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
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
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

            {/* Register Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ebf2ff] hover:bg-blue-100 text-[#0066ff] font-bold py-4 rounded-md transition-colors mt-4 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'REGISTER'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account? <a href="/aboutus/signin" className="font-bold text-gray-900 underline">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
