'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

  const [step, setStepState] = useState<Step>(() => {
    const urlStep = searchParams.get('step');
    if (urlStep === 'form') return 'form';
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('signupStep') as Step | null;
      if (savedStep === 'form') return 'form';
    }
    return 'email';
  });

  const setStep = (newStep: Step) => {
    setStepState(newStep);
    if (typeof window !== 'undefined') {
      if (newStep === 'email') {
        localStorage.removeItem('signupStep');
        const url = new URL(window.location.href);
        url.searchParams.delete('step');
        window.history.replaceState({}, '', url.pathname + url.search);
      } else {
        localStorage.setItem('signupStep', newStep);
        const url = new URL(window.location.href);
        url.searchParams.set('step', newStep);
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  };

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('completeProfileStep');
        localStorage.removeItem('signupStep');
      }
      router.push('/complete-profile?step=business-type');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setErrors((prev) => ({ ...prev, password: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  const PrimaryButton = ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="submit"
      disabled={disabled}
      className="w-full mt-2 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-bold text-white disabled:opacity-60"
      style={{
        background:
          'linear-gradient(90deg, rgba(255, 247, 0, 0.57715) 0%, rgba(255, 172, 6, 0.623225) 31.21%, rgba(196, 67, 69, 0.646263) 66.1%, rgba(155, 63, 188, 0.6693) 99.27%)',
        boxShadow: '-1px 1px 8px 3px #B3850896',
        fontFamily: "'Inter Display','Inter',sans-serif",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-[#05020F] text-white">
      <div className="flex flex-col md:flex-row min-h-screen max-w-[1440px] mx-auto overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {/* Left onboarding stepper panel */}
        <div className="relative w-full md:w-[420px] bg-[#05020F] text-white flex flex-col justify-between px-5 sm:px-7 pt-4 sm:pt-10 pb-6 sm:pb-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="pt-4 sm:pt-2">
              <h2
                className="text-2xl sm:text-3xl font-bold leading-tight"
                style={{
                  fontFamily: "'Inter Display','Inter',sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                Let&apos;s Get Your
                <br />
                Business Ready
              </h2>
              <p className="mt-3 text-sm text-gray-300 max-w-xs">
                Add a few details so we can get everything ready for you.
              </p>
            </div>

            {/* Mobile progress bar + current step */}
            <div className="mt-5 space-y-2 md:hidden">
              <div className="h-2 rounded-full bg-[#2A2738] overflow-hidden">
                <div
                  className="h-full w-1/5 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255, 247, 0, 0.8) 0%, rgba(255, 172, 6, 0.95) 40%, rgba(196, 67, 69, 0.95) 75%, rgba(155, 63, 188, 0.95) 100%)',
                    boxShadow: '0px 0px 10px rgba(235, 121, 255, 0.6)',
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 0%, #F7931E 0%, #F9B233 40%, #F15A24 70%, #A345FF 100%)',
                    boxShadow: '0 0 12px rgba(249,178,51,0.9)',
                  }}
                >
                  1
                </div>
                <span className="text-sm font-semibold text-white">
                  Your Account Details
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-5 hidden md:block">
              {[
                'Your Account Details',
                'Business Type',
                'Business Information',
                'Preferences',
                'Preview',
              ].map((label, index) => {
                const active = index === 0;
                return (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center border"
                        style={
                          active
                            ? {
                                background:
                                  'radial-gradient(circle at 30% 0%, #F7931E 0%, #F9B233 40%, #F15A24 70%, #A345FF 100%)',
                                boxShadow: '0 0 12px rgba(249,178,51,0.9)',
                                borderColor: 'transparent',
                              }
                            : { borderColor: '#4B4A55', backgroundColor: '#15131F' }
                        }
                      >
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      {index < 4 && (
                        <div className="flex-1 w-px grow mt-1 bg-gradient-to-b from-[#F9B233] via-[#4B4A55] to-[#4B4A55]" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-sm font-semibold ${
                          active ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="mt-8 text-sm font-semibold text-gray-300 hover:text-white w-fit"
            onClick={() => router.back()}
          >
            Back
          </button>
        </div>

        {/* Right content panel */}
        <div className="relative flex-1 bg-transparent md:bg-white text-black px-4 sm:px-6 lg:px-12 pb-8 pt-6 sm:pt-8 flex flex-col">
          {/* Centered content */}
          <div className="flex-1 flex items-start md:items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-3xl md:rounded-none md:bg-transparent shadow-[0px_16px_40px_rgba(0,0,0,0.38)] md:shadow-none px-5 py-6 sm:px-6 sm:py-7 md:p-0 md:shadow-none">
              {step === 'email' && (
                <form
                  onSubmit={handleEmailStep}
                  className="w-full space-y-5 sm:space-y-6"
                >
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold leading-snug"
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <span style={{ color: '#F9B233' }}>Lets</span> grab some quick{' '}
                      <span style={{ color: '#F9B233' }}>info</span> to create your
                      account.
                    </h2>
                    <p className="text-sm text-gray-700 mt-3">
                      Enter Your E-mail ID Below
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                        <Image
                          src="/assets/icons/mailicon.png"
                          alt="Email"
                          width={18}
                          height={18}
                          className="object-contain"
                        />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="E-mail"
                        autoComplete="email"
                        autoFocus
                        className={`w-full pl-11 pr-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-400 text-[16px] leading-6 ${
                          errors.email
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-[#F3D1EE] hover:border-[#F9B233]/60'
                        }`}
                        style={{
                          background:
                            'linear-gradient(90deg, #FFFFFF 0%, #F9F9FF 100%)',
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs font-medium ml-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-xs flex gap-2 items-start">
                      <span className="mt-0.5">⚠️</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  <PrimaryButton disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </PrimaryButton>

                  <p className="text-center text-sm text-gray-700 pt-1 break-words">
                    Already Have An Account ?{' '}
                    <Link
                      href="/signin"
                      className="font-bold hover:underline"
                      style={{ color: '#612178' }}
                    >
                      Log In
                    </Link>
                  </p>
                </form>
              )}

              {step === 'form' && (
                <form
                  onSubmit={handleRegister}
                  className="w-full space-y-5 sm:space-y-6"
                >
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"
                  >
                    ← Back
                  </button>
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold leading-snug"
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <span style={{ color: '#F9B233' }}>Lets</span> Set Up Your
                      Password
                    </h2>
                    <p className="text-sm text-gray-700 mt-2">
                      Enter Your Password Below
                    </p>
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
                        className={`w-full px-4 pr-11 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-400 text-[16px] leading-6 ${
                          errors.password
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-[#F3D1EE]'
                        }`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs font-medium ml-1">
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">
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
                        className={`w-full px-4 pr-11 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-400 text-[16px] leading-6 ${
                          errors.confirmPassword
                            ? 'border-red-400 bg-red-50/30'
                            : 'border-[#F3D1EE]'
                        }`}
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs font-medium ml-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-xs flex gap-2 items-start">
                      <span className="mt-0.5">⚠️</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  <PrimaryButton disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </PrimaryButton>

                  <p className="text-center text-sm text-gray-700 pt-1 break-words">
                    Already Have An Account ?{' '}
                    <Link
                      href="/signin"
                      className="font-bold hover:underline"
                      style={{ color: '#612178' }}
                    >
                      Log In
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
