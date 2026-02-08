'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthLayout from '@/components/AuthLayout';
import { setAuthData, loginWithOtp, verifyEmailOtp } from '@/lib/auth';
import { checkUserProfile } from '@/lib/profile';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateEmailForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailForm()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      await loginWithOtp(formData.email);
      setStep('otp');
    } catch (error: any) {
      console.error('Login OTP error:', error);
      setSubmitError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtpForm()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const data = await verifyEmailOtp(formData.email, parseInt(formData.otp));
      
      setAuthData(data.jwt, data.user);
      
      try {
        const profile = await checkUserProfile(data.user.id);
        if (profile) {
          router.push('/');
        } else {
          router.push('/company-profile');
        }
      } catch (profileError) {
        console.error('Error checking profile:', profileError);
        router.push('/company-profile');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setSubmitError(error.message || 'Invalid OTP. Please try again.');
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
      <form 
        className="w-full space-y-4 flex-1" 
        onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp}
      >
        {step === 'email' ? (
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
        ) : (
          <div className="relative">
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 placeholder-[#94a3b8] ${
                errors.otp ? 'border-red-500' : 'border-[#e2e8f0]'
              }`}
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              OTP sent to {formData.email}
            </p>
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="text-xs font-semibold text-blue-600 hover:underline mt-1"
            >
              Change Email
            </button>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div className="flex justify-end">
          {step === 'email' && (
            <a href="#" className="text-xs font-semibold text-black hover:underline">
              Forgot Password
            </a>
          )}
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#eff6ff] text-[#1e293b] font-bold text-sm rounded-md hover:bg-blue-100 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? (step === 'email' ? 'Sending OTP...' : 'Verifying...') 
            : (step === 'email' ? 'SEND OTP' : 'VERIFY OTP')
          }
        </button>
      </form>

      <div className="mt-8 text-sm text-gray-600 text-center">
        Don't have an account? <a href="/signup" className="text-black font-bold hover:underline">Signup</a>
      </div>
    </AuthLayout>
  );
}
//#region 