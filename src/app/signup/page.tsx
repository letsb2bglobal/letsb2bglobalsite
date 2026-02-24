'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import { setAuthData, register, verifySignupOtp, resendSignupOtp } from '@/lib/auth';

// ── Password validation rules ────────────────────────────────────────────
const validatePassword = (pw: string) => ({
  length:    pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  number:    /[0-9]/.test(pw),
});

type Step = 'form' | 'otp';

export default function SignUpPage() {
  const router = useRouter();

  // ── Form state ────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Resend countdown ──────────────────────────────────────────────────
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Derived ───────────────────────────────────────────────────────────
  const pwRules = validatePassword(formData.password);
  const pwStrong = pwRules.length && pwRules.uppercase && pwRules.number;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.trim().length < 2) newErrors.username = 'Min 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!pwStrong) newErrors.password = 'Password does not meet requirements';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 — Register → get OTP sent
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      await register(formData.email, formData.username, formData.password);
      setStep('otp');
      startCooldown(60);
    } catch (err: any) {
      const msg: string = err.message || 'Registration failed';
      if (msg.includes('already registered')) {
        setErrors((p) => ({ ...p, email: 'Email already registered' }));
        setSubmitError('This email is already registered. Please login instead.');
      } else if (msg.includes('already taken')) {
        setErrors((p) => ({ ...p, username: 'Username already taken' }));
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: 'Enter the 6-digit code' });
      return;
    }
    setIsLoading(true);
    setSubmitError('');
    try {
      const data = await verifySignupOtp(formData.email, otp);
      setAuthData(data.jwt, data.user);
      router.push('/complete-profile');
    } catch (err: any) {
      setSubmitError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setSubmitError('');
    try {
      await resendSignupOtp(formData.email);
      setOtp('');
      startCooldown(60);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend OTP');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <Image src="/images/logo.png" alt="LetsB2B" width={48} height={48} className="object-contain mr-3" />
        <div className="flex flex-col">
          <span className="text-2xl tracking-tight text-[#1e293b] leading-none mb-1">
            <span className="font-normal">LET'S</span> <span className="font-bold">B2B</span>
          </span>
          <span className="text-[10px] tracking-[0.4em] text-blue-600 font-bold uppercase">Global</span>
        </div>
      </div>

      {/* ── STEP: FORM ────────────────────────────────────────────────── */}
      {step === 'form' && (
        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join the B2B travel community</p>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="username"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 bg-gray-50 transition-all ${
                errors.username ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.username && <p className="text-red-500 text-xs font-medium ml-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 bg-gray-50 transition-all ${
                errors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 bg-gray-50 transition-all ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
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

            {/* Password strength hints */}
            {formData.password && (
              <div className="flex gap-3 mt-2 ml-1">
                {[
                  { label: '8+ chars', ok: pwRules.length },
                  { label: 'Uppercase', ok: pwRules.uppercase },
                  { label: 'Number', ok: pwRules.number },
                ].map(({ label, ok }) => (
                  <span key={label} className={`text-[10px] font-bold flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>{ok ? '✓' : '○'}</span> {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Global error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
              <span className="mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending OTP...
              </>
            ) : 'CREATE ACCOUNT'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>
        </form>
      )}

      {/* ── STEP: OTP ─────────────────────────────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleVerify} className="w-full space-y-5">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
            <p className="text-sm text-gray-500 mt-1">
              We sent a 6-digit code to<br />
              <span className="font-bold text-gray-700">{formData.email}</span>
            </p>
          </div>

          {/* OTP input — large digits */}
          <div className="space-y-1">
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-3xl font-black tracking-[0.5em] text-gray-800 bg-gray-50 transition-all ${
                errors.otp ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.otp && <p className="text-red-500 text-xs font-medium text-center">{errors.otp}</p>}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
              <span className="mt-0.5">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : 'VERIFY & SIGN IN'}
          </button>

          {/* Resend & back */}
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep('form'); setOtp(''); setSubmitError(''); }}
              className="text-gray-400 hover:text-gray-600 font-medium"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-bold transition-colors ${
                resendCooldown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}