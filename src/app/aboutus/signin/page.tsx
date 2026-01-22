'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
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
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
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
      //   setSubmitError(error.message || 'Login failed');
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
  const leftImage = "https://csspicker.dev/api/image/?q=business+network&image_type=illustration";

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Section */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#f3f4f6] p-12">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full aspect-video bg-[#cbd5e1] rounded-sm flex items-center justify-center relative overflow-hidden mb-12">
             <svg className="w-full h-full text-[#94a3b8]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
             </svg>
          </div>
          <button className="w-full py-4 bg-[#0066ff] text-white text-xl font-semibold rounded-md hover:bg-blue-700 transition-colors">
            List Your Business
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-8 md:p-20">
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <div className="mr-3">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 20L80 50L30 80V20Z" fill="#0066ff" />
                <circle cx="20" cy="30" r="4" fill="#0066ff" />
                <circle cx="15" cy="45" r="4" fill="#0066ff" />
                <rect x="18" y="55" width="8" height="8" fill="#ff6600" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#1e293b] tracking-tight">{logoText}</span>
              <span className="text-[10px] tracking-[0.4em] text-[#94a3b8] -mt-1">{subLogoText}</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-[#1e293b] mb-2">Login</h2>
          <p className="text-sm text-[#64748b] mb-8 text-center">
            Lorem Ipsum is simply dummy text of the printing
          </p>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Mail"
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

            <div className="flex justify-end">
              <a href="#" className="text-xs font-semibold text-black hover:underline">
                Forgot Password
              </a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#eff6ff] text-[#1e293b] font-bold text-sm rounded-md hover:bg-blue-100 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-600">
            Don't have an account? <a href="/aboutus/signup" className="text-black font-bold hover:underline">Signup</a>
          </div>
        </div>
      </div>
    </div>
  );
}
//#region 