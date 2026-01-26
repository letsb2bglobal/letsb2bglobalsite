'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthLayout from '@/components/AuthLayout';
import { setAuthData } from '@/lib/auth';
import { checkUserProfile } from '@/lib/profile';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';
      const response = await fetch(`${apiUrl}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store JWT token and user data in cookies using js-cookie
        setAuthData(data.jwt, data.user);
        
        // Check if user profile exists
        try {
          const profile = await checkUserProfile(data.user.id);
          
          if (profile) {
            // Profile exists, redirect to dashboard
            router.push('/');
          } else {
            // Profile doesn't exist, redirect to complete profile page
            router.push('/company-profile');
          }
        } catch (profileError) {
          console.error('Error checking profile:', profileError);
          // If there's an error checking profile, still redirect to complete profile page
          router.push('/company-profile');
        }
      } else {
        // Handle error response
        const errorMessage = data?.error?.message || 'Invalid email or password';
        setSubmitError(errorMessage);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Network error. Please check your connection and try again.');
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
          <span className="text-2xl tracking-tight text-[#1e293b]">
            <span className="font-normal">LET'S</span>{' '}
            <span className="font-bold">B2B</span>
          </span>
          <span className="text-[10px] tracking-[0.4em] text-[#94a3b8] -mt-1">{subLogoText}</span>
        </div>
      </div>

      {/* Header - Fixed Height */}
      <div className="text-center mb-8" style={{ minHeight: '80px' }}>
        <h2 className="text-2xl font-semibold text-[#1e293b] mb-2">Login</h2>
        <p className="text-sm text-[#64748b] text-center">
          Lorem Ipsum is simply dummy text of the printing
        </p>
      </div>

      {/* Form - Takes remaining space */}
      <form className="w-full space-y-4 flex-1" onSubmit={handleSubmit}>
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
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] pr-12 transition-all ${
              errors.password ? 'border-red-500 bg-red-50/30' : 'border-[#e2e8f0]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {errors.password}
            </p>
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

      <div className="mt-8 text-sm text-gray-600 text-center">
        Don't have an account? <a href="/signup" className="text-black font-bold hover:underline">Signup</a>
      </div>
    </AuthLayout>
  );
}
//#region 