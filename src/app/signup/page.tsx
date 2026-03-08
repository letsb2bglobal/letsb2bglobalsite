'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import { checkEmail, register, setAuthData } from '@/lib/auth';

const validatePassword = (pw: string) => ({
  length: pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  number: /[0-9]/.test(pw),
});

type Step = 'email' | 'form';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>(() =>
    searchParams.get('step') === 'form' ? 'form' : 'email'
  );
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pwRules = validatePassword(formData.password);
  const pwStrong = pwRules.length && pwRules.uppercase && pwRules.number;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  // Step 1 — Email only, Continue → form (check-email API)
  const handleEmailStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setSubmitError('');
    setErrors((prev) => ({ ...prev, email: '' }));
    try {
      await checkEmail(formData.email.trim());
      setStep('form');
    } catch (err: any) {
      const msg = err?.message || 'Email check failed';
      setErrors((prev) => ({ ...prev, email: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Register (API)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!pwStrong) newErrors.password = 'Password does not meet requirements';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setSubmitError('');
    setErrors((prev) => ({ ...prev, password: '' }));
    try {
      const data = await register(formData.email.trim(), formData.password);
      setAuthData(data.jwt, data.user);
      router.push('/complete-profile');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setErrors((prev) => ({ ...prev, password: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout variant="signup">
      {/* ── STEP 1: Email (new design) ───────────────────────────────────── */}
      {step === 'email' && (
        <form onSubmit={handleEmailStep} className="w-full max-w-full space-y-4 sm:space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black leading-tight">
              <span style={{ color: '#612178' }}>Lets</span> grab some quick{' '}
              <span style={{ color: '#612178' }}>info</span> to create your account.
            </h2>
            <p className="text-sm text-black mt-3">Enter Your E-mail ID Below</p>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail ID"
                autoComplete="email"
                autoFocus
                className={`w-full pl-12 pr-4 py-3 sm:py-3.5 border rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#612178] text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                  errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
              <span className="mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-bold text-sm sm:text-base flex items-center justify-center transition-all min-h-[48px] sm:min-h-[50px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#612178',
              borderRadius: '16px',
              boxShadow: '0px 4px 10px -2px #00000040',
            }}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Checking...
              </>
            ) : (
              'Continue'
            )}
          </button>

          <p className="text-center text-sm text-black pt-1 break-words">
            Already Have An Account ?{' '}
            <Link href="/signin" className="font-bold hover:underline touch-manipulation" style={{ color: '#612178' }}>
              Log In
            </Link>
          </p>
        </form>
      )}

      {/* ── STEP 2: Set Up Password (Figma design) ───────────────────────── */}
      {step === 'form' && (
        <form onSubmit={handleRegister} className="w-full max-w-full space-y-4 sm:space-y-5">
          <div>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-800 flex items-center gap-1 mb-3 sm:mb-4 touch-manipulation py-1"
            >
              ← Back
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black leading-tight">
              <span style={{ color: '#612178' }}>Lets</span> Set Up Your Password
            </h2>
            <p className="text-sm text-black mt-3">Enter Your Password Below</p>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 sm:py-3.5 pr-11 border rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#612178] text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-medium ml-1">{errors.password}</p>}
            <p className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 ml-1">
              <img src="/info-icon.png" alt="" className="w-4 h-4 flex-shrink-0" />
              The password should have a number
            </p>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 sm:py-3.5 pr-11 border rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#612178] text-base text-gray-800 placeholder-gray-400 bg-white transition-all ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs font-medium ml-1">{errors.confirmPassword}</p>}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
              <span className="mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-bold text-sm sm:text-base flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[50px] touch-manipulation"
            style={{
              background: '#612178',
              borderRadius: '16px',
              boxShadow: '0px 4px 10px -2px #00000040',
            }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>

          <p className="text-center text-sm text-black pt-1 break-words">
            Already Have An Account ?{' '}
            <Link href="/signin" className="font-bold hover:underline touch-manipulation" style={{ color: '#612178' }}>
              Log In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
