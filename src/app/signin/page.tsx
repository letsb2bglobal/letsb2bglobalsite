'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import {
  setAuthData,
  login,
  resendSignupOtp,
  forgotPasswordOtp,
  verifyResetOtp,
  updatePassword,
} from '@/lib/auth';
import { checkUserProfile } from '@/lib/profile';

// ── Step types ────────────────────────────────────────────────────────────
type LoginStep = 'login' | 'unverified';
type ForgotStep = 'email' | 'otp' | 'newPassword';

export default function SignInPage() {
  const router = useRouter();

  // ── Mode: login | forgot ──────────────────────────────────────────────
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // ── Login state ───────────────────────────────────────────────────────
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // ── Forgot password state ─────────────────────────────────────────────
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');           // kept in memory only
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ── Shared ────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Resend cooldown ───────────────────────────────────────────────────
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const clearAll = () => {
    setErrors({});
    setSubmitError('');
    setSubmitSuccess('');
  };

  // ── PASSWORD-STRENGTH (for reset) ─────────────────────────────────────
  const pwValid = newPassword.length >= 8;

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIN HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setSubmitError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!loginData.identifier.trim()) newErrors.identifier = 'Email or username is required';
    if (!loginData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true); clearAll();
    try {
      const data = await login(loginData.identifier, loginData.password);
      setAuthData(data.jwt, data.user);
      try {
        const profile = await checkUserProfile(data.user.id);
        router.push(profile ? '/' : '/complete-profile');
      } catch {
        router.push('/complete-profile');
      }
    } catch (err: any) {
      if (err.message === 'UNVERIFIED_EMAIL') {
        setUnverifiedEmail(loginData.identifier);
        setLoginStep('unverified');
      } else {
        setSubmitError(err.message || 'Wrong email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend signup OTP for unverified user
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    clearAll();
    try {
      await resendSignupOtp(unverifiedEmail);
      setSubmitSuccess('Verification code resent! Check your inbox.');
      startCooldown(60);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend code');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  const switchToForgot = () => {
    setMode('forgot');
    setForgotStep('email');
    setForgotEmail(loginData.identifier.includes('@') ? loginData.identifier : '');
    clearAll();
  };

  // Step 1 — send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'Enter a valid email address' });
      return;
    }
    setIsLoading(true); clearAll();
    try {
      await forgotPasswordOtp(forgotEmail);
      setForgotStep('otp');
      setForgotOtp('');
      startCooldown(60);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — verify reset OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length !== 6) {
      setErrors({ forgotOtp: 'Enter the 6-digit reset code' });
      return;
    }
    setIsLoading(true); clearAll();
    try {
      const data = await verifyResetOtp(forgotEmail, forgotOtp);
      setResetToken(data.resetToken);
      setForgotStep('newPassword');
    } catch (err: any) {
      setSubmitError(err.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset OTP
  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return;
    clearAll();
    try {
      await forgotPasswordOtp(forgotEmail);
      setSubmitSuccess('New code sent!');
      startCooldown(60);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend code');
    }
  };

  // Step 3 — set new password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!newPassword) newErrors.newPassword = 'Password is required';
    else if (!pwValid) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true); clearAll();
    try {
      const data = await updatePassword(forgotEmail, resetToken, newPassword);
      setAuthData(data.jwt, data.user);
      // Brief success flash before redirect
      setSubmitSuccess('Password updated! Signing you in...');
      setTimeout(() => router.push('/'), 1000);
    } catch (err: any) {
      if (err.message?.includes('start over')) {
        setSubmitError('Reset link expired. Please start over.');
        setForgotStep('email');
        setResetToken('');
      } else {
        setSubmitError(err.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared error/success banners ────────────────────────────────────
  const ErrorBanner = ({ msg }: { msg: string }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
      <span className="mt-0.5 shrink-0">⚠️</span>
      <span>{msg}</span>
    </div>
  );
  const SuccessBanner = ({ msg }: { msg: string }) => (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex gap-2 items-start">
      <span className="mt-0.5 shrink-0">✅</span>
      <span>{msg}</span>
    </div>
  );

  const OtpInput = ({
    value,
    onChange,
  }: { value: string; onChange: (v: string) => void }) => (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
      maxLength={6}
      autoFocus
      className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-3xl font-black tracking-[0.5em] text-gray-800 bg-white"
    />
  );

  // ── Logo (shared) ─────────────────────────────────────────────────────
  const Logo = () => (
    <div className="flex items-center justify-center mb-6">
      <Image src="/LetsB2B_logo.png" alt="LetsB2B" width={220} height={58} className="object-contain" />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: LOGIN FLOW
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'login') {
    return (
      <AuthLayout>
        <Logo />

        {/* ── Normal login ─────────────────────────────────────────────── */}
        {loginStep === 'login' && (
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Log In</h2>
              <p className="text-sm text-gray-400 mt-1">Please enter your details below.</p>
            </div>

            {/* Identifier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">E-mail</label>
              <input
                type="text"
                name="identifier"
                value={loginData.identifier}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                autoComplete="username"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-300 bg-white transition-all ${
                  errors.identifier ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-purple-300'
                }`}
              />
              {errors.identifier && <p className="text-red-500 text-xs font-medium ml-1">{errors.identifier}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-300 bg-white transition-all ${
                    errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-purple-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-xs font-semibold hover:underline mt-1"
                  style={{ color: "#612178" }}
                >
                  Forgot Password ?
                </button>
              </div>
            </div>

            {submitError && <ErrorBanner msg={submitError} />}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{
                background: "#612178",
                borderRadius: "16px",
                boxShadow: "0px 4px 10px -2px #00000040",
              }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-500 pt-1">
              Don't Have An Account ?{' '}
              <span className="font-bold" style={{ color: "#612178" }}>Sign Up</span>
            </p>
          </form>
        )}

        {/* ── Unverified email screen ───────────────────────────────────── */}
        {loginStep === 'unverified' && (
          <div className="w-full space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Email not verified</h2>
              <p className="text-sm text-gray-500 mt-2">
                Your account exists but email isn't verified yet.<br />
                Check <span className="font-bold text-gray-700">{unverifiedEmail}</span> for your verification code.
              </p>
            </div>

            {submitError && <ErrorBanner msg={submitError} />}
            {submitSuccess && <SuccessBanner msg={submitSuccess} />}

            <button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className={`w-full py-3.5 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
                resendCooldown > 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#6c47ff] text-white hover:bg-[#5a35ee] shadow-lg shadow-purple-200'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Code'}
            </button>
            <button
              onClick={() => { setLoginStep('login'); clearAll(); }}
              className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </AuthLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: FORGOT PASSWORD FLOW
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <AuthLayout>
      <Logo />

      {/* ── Step 1: Enter email ──────────────────────────────────────── */}
      {forgotStep === 'email' && (
        <form onSubmit={handleForgotSendOtp} className="w-full space-y-5">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset code</p>
          </div>

          <div className="space-y-1">
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => { setForgotEmail(e.target.value); clearAll(); }}
              placeholder="Email address"
              autoFocus
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white ${
                errors.forgotEmail ? 'border-red-400' : 'border-gray-200 hover:border-purple-300'
              }`}
            />
            {errors.forgotEmail && <p className="text-red-500 text-xs font-medium ml-1">{errors.forgotEmail}</p>}
          </div>

          {submitError && <ErrorBanner msg={submitError} />}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#6c47ff] text-white font-bold text-sm rounded-lg hover:bg-[#5a35ee] transition-all shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
            ) : 'SEND RESET CODE'}
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); clearAll(); }}
            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
          >
            ← Back to Sign In
          </button>
        </form>
      )}

      {/* ── Step 2: Enter OTP ────────────────────────────────────────── */}
      {forgotStep === 'otp' && (
        <form onSubmit={handleForgotVerifyOtp} className="w-full space-y-5">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enter reset code</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sent to <span className="font-bold text-gray-700">{forgotEmail}</span>
            </p>
          </div>

          <OtpInput value={forgotOtp} onChange={(v) => { setForgotOtp(v); clearAll(); }} />
          {errors.forgotOtp && <p className="text-red-500 text-xs font-medium text-center">{errors.forgotOtp}</p>}

          {submitError && <ErrorBanner msg={submitError} />}
          {submitSuccess && <SuccessBanner msg={submitSuccess} />}

          <button
            type="submit"
            disabled={isLoading || forgotOtp.length < 6}
            className="w-full py-3.5 bg-[#6c47ff] text-white font-bold text-sm rounded-lg hover:bg-[#5a35ee] transition-all shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
            ) : 'VERIFY CODE'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setForgotStep('email'); clearAll(); }}
              className="text-gray-400 hover:text-gray-600 font-medium"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleResendResetOtp}
              disabled={resendCooldown > 0}
              className={`font-bold transition-colors ${
                resendCooldown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3: New password ─────────────────────────────────────── */}
      {forgotStep === 'newPassword' && (
        <form onSubmit={handleUpdatePassword} className="w-full space-y-4">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
          </div>

          {/* New password */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' })); }}
                placeholder="New password (min 8 characters)"
                autoFocus
                className={`w-full px-4 py-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white ${
                  errors.newPassword ? 'border-red-400' : 'border-gray-200 hover:border-purple-300'
                }`}
              />
              <button type="button" onClick={() => setShowNewPassword((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showNewPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs font-medium ml-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              placeholder="Confirm new password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-200 hover:border-purple-300'
              }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs font-medium ml-1">{errors.confirmPassword}</p>}
          </div>

          {submitError && <ErrorBanner msg={submitError} />}
          {submitSuccess && <SuccessBanner msg={submitSuccess} />}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
            ) : 'UPDATE PASSWORD'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}