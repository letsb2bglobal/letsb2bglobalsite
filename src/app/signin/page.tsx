'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
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

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Mode: login | forgot ──────────────────────────────────────────────
  const [mode, setModeState] = useState<'login' | 'forgot'>(() => {
    const s = searchParams.get('step');
    if (s === 'forgot-email' || s === 'forgot-otp' || s === 'forgot-password') return 'forgot';
    return 'login';
  });

  const setMode = (newMode: 'login' | 'forgot') => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      if (newMode === 'login') {
        // Update URL - remove step param
        const url = new URL(window.location.href);
        url.searchParams.delete('step');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  };

  // ── Login state ───────────────────────────────────────────────────────
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // ── Forgot password state ─────────────────────────────────────────────
  const [forgotStep, setForgotStepState] = useState<ForgotStep>(() => {
    const s = searchParams.get('step');
    if (s === 'forgot-otp') return 'otp';
    if (s === 'forgot-password') return 'newPassword';
    return 'email';
  });

  const setForgotStep = (step: ForgotStep) => {
    setForgotStepState(step);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (step === 'email') {
        url.searchParams.set('step', 'forgot-email');
      } else if (step === 'otp') {
        url.searchParams.set('step', 'forgot-otp');
      } else if (step === 'newPassword') {
        url.searchParams.set('step', 'forgot-password');
      }
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');           // kept in memory only
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(
    () => searchParams.get('step') === 'forgot-success'
  );

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
        if (profile) {
          router.push('/home');
        } else {
          // Clear onboarding localStorage so user starts from step 1
          if (typeof window !== 'undefined') {
            localStorage.removeItem('completeProfileStep');
          }
          router.push('/complete-profile?step=business-type');
        }
      } catch {
        // Clear onboarding localStorage so user starts from step 1
        if (typeof window !== 'undefined') {
          localStorage.removeItem('completeProfileStep');
        }
        router.push('/complete-profile?step=business-type');
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
      setShowPasswordResetModal(true);
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
    <div className="flex items-center justify-center mb-4">
      <Image src="/LetsB2B_logo1.png" alt="LetsB2B" width={460} height={122} className="object-contain max-w-full h-auto" />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: LOGIN FLOW
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'login') {
    return (
      <>
        {/* ── New login card layout (UI only) ────────────────────────────── */}
        {loginStep === 'login' && (
          <div className="w-full min-h-screen bg-[#05020F] text-white">
            <div className="flex flex-col md:flex-row min-h-screen max-w-[1440px] mx-auto overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              {/* Left visual panel */}
              <div className="relative md:w-[806px] md:h-auto">
                <div className="absolute inset-0">
                  <Image
                    src="/assets/images/loginbackpic.png"
                    alt="We Are Lets B2B"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05020F] via-[#05020F]/60 to-transparent" />
                </div>
                <div className="relative z-10 flex h-full items-end">
                  <div
                    className="w-full rounded-t-2xl sm:rounded-t-3xl rounded-b-none sm:rounded-b-none px-6 sm:px-7 py-4 sm:py-5"
                    style={{
                      background:
                        "linear-gradient(270deg, rgba(6, 4, 35, 0.79) 0%, rgba(31, 30, 37, 0.79) 100%)",
                    }}
                  >
                    <h2
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white"
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      We Are Lets B2B
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-gray-200">
                      We are a global B2B networking &amp; trading platform built exclusively
                      for tourism &amp; hospitality. Connect with verified professionals &amp;
                      businesses across markets.
                    </p>

                    {/* Stepper indicator */}
                    <div className="mt-4 flex items-center gap-2">
                      <div
                        className="h-1.5 w-10 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(255, 102, 196, 0.95) 0%, rgba(97, 33, 120, 0.95) 100%)",
                          boxShadow: "0px 0px 10px rgba(235, 121, 255, 0.6)",
                        }}
                      />
                      <div className="h-1.5 w-8 rounded-full" style={{ background: "#1F1E25" }} />
                      <div className="h-1.5 w-8 rounded-full" style={{ background: "#1F1E25" }} />
                      <div className="h-1.5 w-8 rounded-full" style={{ background: "#1F1E25" }} />
                    </div>
                  </div>
                </div>
              </div>
                  

              {/* Right login panel */}
              <div className="relative md:w-[663px] flex-col justify-between px-5 sm:px-7 py-6 sm:py-8 min-h-full">
                {/* Vertical divider with rounded bottom */}
                <div className="hidden md:block absolute -left-px top-0 h-full w-px bg-white shadow-[0px_2px_10px_0px_#ECFF4678] rounded-b-full" />
                {/* Top actions */}
                <div className="flex justify-end gap-3 mb-[123.17px]">
                  <Link
                    href="/download"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{ background: "#9747FF", color: "#FFFFFF" }}
                  >
                    <Image
                      src="/assets/icons/android.png"
                      alt="Android"
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                    <span>Download App</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "#FEA40C9C", color: "var(--Background-Colour, #FFFFFF)" }}
                  >
                    Sign Up
                  </Link>
                </div>

                {/* Logo + form */}
                <div className="flex-1 flex flex-col justify-center gap-6">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/assets/icons/b2blogofinal.png"
                      alt="LetsB2B"
                      width={260}
                      height={72}
                      className="object-contain"
                    />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Log In</h2>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Please enter your details below.
                      </p>
                    </div>

                    {/* Identifier */}
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
                          type="text"
                          name="identifier"
                          value={loginData.identifier}
                          onChange={handleLoginChange}
                          placeholder="E-mail"
                          autoComplete="username"
                          className={`w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-500 text-[16px] leading-6 ${
                            errors.identifier
                              ? "border-red-400 bg-red-500/10"
                              : "border-white/15 hover:border-[#F9B233]/60"
                          }`}
                          style={{
                            fontFamily: "'Inter Display','Inter',sans-serif",
                            fontWeight: 400,
                          }}
                        />
                      </div>
                      {errors.identifier && (
                        <p className="text-red-400 text-xs font-medium ml-1">
                          {errors.identifier}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                          <Image
                            src="/assets/icons/passwoardicon.png"
                            alt="Password"
                            width={18}
                            height={18}
                            className="object-contain"
                          />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Password"
                          autoComplete="current-password"
                          className={`w-full pl-11 pr-11 py-3 rounded-full bg-white/5 border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-500 text-[16px] leading-6 ${
                            errors.password
                              ? "border-red-400 bg-red-500/10"
                              : "border-white/15 hover:border-[#F9B233]/60"
                          }`}
                          style={{
                            fontFamily: "'Inter Display','Inter',sans-serif",
                            fontWeight: 400,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
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
                              className="w-5 h-5"
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
                        <p className="text-red-400 text-xs font-medium ml-1">
                          {errors.password}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={switchToForgot}
                          className="text-xs font-semibold text-[#F9B233] hover:text-[#fde68a] underline underline-offset-2 mt-1"
                          style={{ fontFamily: "'Inter Display','Inter',sans-serif" }}
                        >
                          Forgot Password ?
                        </button>
                      </div>
                    </div>

                    {submitError && <ErrorBanner msg={submitError} />}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-bold text-white disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(255, 247, 0, 0.57715) 0%, rgba(255, 172, 6, 0.623225) 31.21%, rgba(196, 67, 69, 0.646263) 66.1%, rgba(155, 63, 188, 0.6693) 99.27%)",
                        boxShadow: "-1px 1px 8px 3px #B3850896",
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </form>

                  {/* OR separator + secondary CTA */}
                  <div className="pt-4 space-y-3">
                    <p className="text-center text-xs sm:text-sm text-gray-400">OR</p>
                    <Link
                      href="/signup"
                      className="block w-full h-10 rounded-full bg-[#111111] text-white text-sm font-semibold flex items-center justify-center hover:bg-black transition-colors"
                      style={{ boxShadow: "0px 0px 0px 1px #FFFFFF1A" }}
                    >
                      Create An Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD - EMAIL STEP (custom layout, matches signin design)
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'forgot' && forgotStep === 'email') {
    return (
      <div className="w-full min-h-screen bg-[#05020F] text-white">
        <div className="flex flex-col md:flex-row min-h-screen max-w-[1440px] mx-auto overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Left visual panel (same as signin) */}
          <div className="relative md:w-[806px] md:h-auto">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/loginbackpic.png"
                alt="We Are Lets B2B"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05020F] via-[#05020F]/60 to-transparent" />
            </div>
            <div className="relative z-10 flex h-full items-end">
              <div
                className="w-full rounded-t-2xl sm:rounded-t-3xl rounded-b-none sm:rounded-b-none px-6 sm:px-7 py-4 sm:py-5"
                style={{
                  background:
                    'linear-gradient(270deg, rgba(6, 4, 35, 0.79) 0%, rgba(31, 30, 37, 0.79) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold text-white"
                  style={{
                    fontFamily: "'Inter Display','Inter',sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  We Are Lets B2B
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-200">
                  We are a global B2B networking &amp; trading platform built exclusively
                  for tourism &amp; hospitality. Connect with verified professionals &amp;
                  businesses across markets.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-1.5 w-10 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255, 102, 196, 0.95) 0%, rgba(97, 33, 120, 0.95) 100%)',
                      boxShadow: '0px 0px 10px rgba(235, 121, 255, 0.6)',
                    }}
                  />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Forgot password email form */}
          <div className="relative md:w-[663px] flex-col justify-between px-5 sm:px-7 py-6 sm:py-8">
            <div className="hidden md:block absolute -left-px top-0 h-full w-px bg-white shadow-[0px_2px_10px_0px_#ECFF4678] rounded-b-full" />
            {/* Top actions */}
            <div className="flex justify-end gap-3 mb-[123.17px]">
              <Link
                href="/download"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{ background: '#9747FF', color: '#FFFFFF' }}
              >
                <Image
                  src="/assets/icons/android.png"
                  alt="Android"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>Download App</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#FEA40C9C', color: 'var(--Background-Colour, #FFFFFF)' }}
              >
                Sign Up
              </Link>
            </div>

            {/* Logo + form */}
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/icons/b2blogofinal.png"
                  alt="LetsB2B"
                  width={260}
                  height={72}
                  className="object-contain"
                />
              </div>

              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Forgot Password</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Please enter your details below.
                  </p>
                </div>

                {/* Email input with icon */}
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
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        clearAll();
                      }}
                      placeholder="E-mail"
                      autoFocus
                      autoComplete="email"
                      className={`w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border focus:outline-none focus:ring-2 focus:ring-[#F9B233] placeholder:text-gray-500 text-[16px] leading-6 ${
                        errors.forgotEmail
                          ? 'border-red-400 bg-red-500/10'
                          : 'border-white/15 hover:border-[#F9B233]/60'
                      }`}
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        fontWeight: 400,
                      }}
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-red-400 text-xs font-medium ml-1">
                      {errors.forgotEmail}
                    </p>
                  )}
                </div>

                {submitError && <ErrorBanner msg={submitError} />}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255, 247, 0, 0.57715) 0%, rgba(255, 172, 6, 0.623225) 31.21%, rgba(196, 67, 69, 0.646263) 66.1%, rgba(155, 63, 188, 0.6693) 99.27%)',
                    boxShadow: '-1px 1px 8px 3px #B3850896',
                    fontFamily: "'Inter Display','Inter',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD - OTP STEP (custom layout, matches signin design)
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'forgot' && forgotStep === 'otp') {
    return (
      <div className="w-full min-h-screen bg-[#05020F] text-white">
        <div className="flex flex-col md:flex-row min-h-screen max-w-[1440px] mx-auto overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Left visual panel (same as signin) */}
          <div className="relative md:w-[806px] md:h-auto">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/loginbackpic.png"
                alt="We Are Lets B2B"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05020F] via-[#05020F]/60 to-transparent" />
            </div>
            <div className="relative z-10 flex h-full items-end">
              <div
                className="w-full rounded-t-2xl sm:rounded-t-3xl rounded-b-none sm:rounded-b-none px-6 sm:px-7 py-4 sm:py-5"
                style={{
                  background:
                    'linear-gradient(270deg, rgba(6, 4, 35, 0.79) 0%, rgba(31, 30, 37, 0.79) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold text-white"
                  style={{
                    fontFamily: "'Inter Display','Inter',sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  We Are Lets B2B
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-200">
                  We are a global B2B networking &amp; trading platform built exclusively
                  for tourism &amp; hospitality. Connect with verified professionals &amp;
                  businesses across markets.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-1.5 w-10 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255, 102, 196, 0.95) 0%, rgba(97, 33, 120, 0.95) 100%)',
                      boxShadow: '0px 0px 10px rgba(235, 121, 255, 0.6)',
                    }}
                  />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: OTP form */}
          <div className="relative md:w-[663px] flex-col justify-between px-5 sm:px-7 py-6 sm:py-8">
            <div className="hidden md:block absolute -left-px top-0 h-full w-px bg-white shadow-[0px_2px_10px_0px_#ECFF4678] rounded-b-full" />
            {/* Top actions */}
            <div className="flex justify-end gap-3 mb-[123.17px]">
              <Link
                href="/download"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{ background: '#9747FF', color: '#FFFFFF' }}
              >
                <Image
                  src="/assets/icons/android.png"
                  alt="Android"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>Download App</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#FEA40C9C', color: 'var(--Background-Colour, #FFFFFF)' }}
              >
                Sign Up
              </Link>
            </div>

            {/* Logo + OTP form */}
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/icons/b2blogofinal.png"
                  alt="LetsB2B"
                  width={260}
                  height={72}
                  className="object-contain"
                />
              </div>

              <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Forgot Password ?</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Please enter your OTP we have sent to your E-mail
                  </p>
                </div>

                {/* OTP boxes - same logic, updated styling */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      id={`otp-forgot-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={forgotOtp[i] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const arr = forgotOtp.split('');
                        arr[i] = val.slice(-1);
                        const next = arr.join('').slice(0, 6);
                        setForgotOtp(next);
                        clearAll();
                        if (val && i < 5) {
                          document.getElementById(`otp-forgot-${i + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !forgotOtp[i] && i > 0) {
                          document.getElementById(`otp-forgot-${i - 1}`)?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData
                          .getData('text')
                          .replace(/\D/g, '')
                          .slice(0, 6);
                        if (pastedData) {
                          setForgotOtp(pastedData);
                          clearAll();
                          const focusIndex = Math.min(pastedData.length, 5);
                          document
                            .getElementById(`otp-forgot-${focusIndex}`)
                            ?.focus();
                        }
                      }}
                      autoFocus={i === 0}
                      className="w-full aspect-square min-w-0 text-center text-base sm:text-xl font-bold rounded-[10px] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F9B233] transition-all"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(255, 255, 255, 0.19) 0%, rgba(255, 234, 251, 0.1102) 100%)',
                        boxShadow: '0px 4px 7px 0px #F5EEFF3D',
                      }}
                    />
                  ))}
                </div>

                {errors.forgotOtp && (
                  <p className="text-red-400 text-xs font-medium">{errors.forgotOtp}</p>
                )}
                {submitError && <ErrorBanner msg={submitError} />}

                <button
                  type="submit"
                  disabled={isLoading || forgotOtp.length < 6}
                  className="w-full mt-4 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background:
                      forgotOtp.length === 6
                        ? 'linear-gradient(90deg, rgba(255, 247, 0, 0.57715) 0%, rgba(255, 172, 6, 0.623225) 31.21%, rgba(196, 67, 69, 0.646263) 66.1%, rgba(155, 63, 188, 0.6693) 99.27%)'
                        : '#D9D9D921',
                    boxShadow:
                      forgotOtp.length === 6 ? '-1px 1px 8px 3px #B3850896' : '0px 0px 0px 1px #FFFFFF1A',
                    fontFamily: "'Inter Display','Inter',sans-serif",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>

                {/* Resend link below, simple text style */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={resendCooldown > 0}
                    className="text-xs sm:text-sm font-semibold text-[#F9B233] disabled:opacity-40"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD - NEW PASSWORD STEP (custom layout, matches signin design)
  // ═══════════════════════════════════════════════════════════════════════
  if (mode === 'forgot' && forgotStep === 'newPassword') {
    return (
      <div className="w-full min-h-screen bg-[#05020F] text-white relative">
        <div className="flex flex-col md:flex-row min-h-screen max-w-[1440px] mx-auto overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Left visual panel (same as signin) */}
          <div className="relative md:w-[806px] md:h-auto">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/loginbackpic.png"
                alt="We Are Lets B2B"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05020F] via-[#05020F]/60 to-transparent" />
            </div>
            <div className="relative z-10 flex h-full items-end">
              <div
                className="w-full rounded-t-2xl sm:rounded-t-3xl rounded-b-none sm:rounded-b-none px-6 sm:px-7 py-4 sm:py-5"
                style={{
                  background:
                    'linear-gradient(270deg, rgba(6, 4, 35, 0.79) 0%, rgba(31, 30, 37, 0.79) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-bold text-white"
                  style={{
                    fontFamily: "'Inter Display','Inter',sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  We Are Lets B2B
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-200">
                  We are a global B2B networking &amp; trading platform built exclusively
                  for tourism &amp; hospitality. Connect with verified professionals &amp;
                  businesses across markets.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-1.5 w-10 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255, 102, 196, 0.95) 0%, rgba(97, 33, 120, 0.95) 100%)',
                      boxShadow: '0px 0px 10px rgba(235, 121, 255, 0.6)',
                    }}
                  />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: '#1F1E25' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: new password form */}
          <div className="relative md:w-[663px] flex-col justify-between px-5 sm:px-7 py-6 sm:py-8">
            <div className="hidden md:block absolute -left-px top-0 h-full w-px bg-white shadow-[0px_2px_10px_0px_#ECFF4678] rounded-b-full" />
            {/* Top actions */}
            <div className="flex justify-end gap-3 mb-[123.17px]">
              <Link
                href="/download"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{ background: '#9747FF', color: '#FFFFFF' }}
              >
                <Image
                  src="/assets/icons/android.png"
                  alt="Android"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>Download App</span>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#FEA40C9C', color: 'var(--Background-Colour, #FFFFFF)' }}
              >
                Sign Up
              </Link>
            </div>

            {/* Logo + new password form */}
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/icons/b2blogofinal.png"
                  alt="LetsB2B"
                  width={260}
                  height={72}
                  className="object-contain"
                />
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Forgot Password</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Please enter your details below.
                  </p>
                </div>

                {/* New password input with icon + eye toggle */}
                <div className="space-y-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <Image
                        src="/assets/icons/passwoardicon.png"
                        alt="Password"
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword)
                          setErrors((p) => ({ ...p, newPassword: '' }));
                      }}
                      placeholder="Enter Password"
                      autoFocus
                      autoComplete="new-password"
                      className="w-full pl-11 pr-11 py-3 rounded-full bg-white/5 border text-[16px] leading-6 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F9B233]"
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        fontWeight: 400,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-400 text-xs font-medium ml-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm password input with icon */}
                <div className="space-y-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <Image
                        src="/assets/icons/passwoardicon.png"
                        alt="Password"
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((p) => ({ ...p, confirmPassword: '' }));
                      }}
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border text-[16px] leading-6 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F9B233]"
                      style={{
                        fontFamily: "'Inter Display','Inter',sans-serif",
                        fontWeight: 400,
                      }}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs font-medium ml-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {submitError && <ErrorBanner msg={submitError} />}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255, 247, 0, 0.57715) 0%, rgba(255, 172, 6, 0.623225) 31.21%, rgba(196, 67, 69, 0.646263) 66.1%, rgba(155, 63, 188, 0.6693) 99.27%)',
                    boxShadow: '-1px 1px 8px 3px #B3850896',
                    fontFamily: "'Inter Display','Inter',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Reset'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Password reset success popup */}
        {showPasswordResetModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: '#0402119E' }}
          >
            <div
              className="bg-white relative flex flex-col items-center text-center w-full shadow-xl"
              style={{
                maxWidth: '528.39px',
                height: '245.51px',
                borderRadius: '24px',
                padding: '32px 32px 28px 32px',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setMode('login');
                  clearAll();
                  router.replace('/signin');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Title — Password Reset ! */}
              <h2
                className="text-2xl sm:text-[32px] font-bold text-black mb-3 sm:mb-2.5"
                style={{
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  lineHeight: '40px',
                  letterSpacing: '-0.02em',
                }}
              >
                Password Reset !
              </h2>

              {/* Message */}
              <p
                className="text-sm sm:text-base text-black mb-6 sm:mb-5"
                style={{
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  lineHeight: '24px',
                  letterSpacing: '0em',
                }}
              >
                Your password has been reset successfully.
                <br />
                You can now Log In with your new password.
              </p>

              {/* Continue button */}
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setMode('login');
                  clearAll();
                  router.replace('/signin');
                }}
                className="w-full max-w-[572px] h-[50px] text-white font-bold text-sm rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255, 247, 0, 0.8) 0%, rgba(255, 172, 6, 0.95) 50%, rgba(255, 137, 79, 0.95) 100%)',
                  boxShadow: '-1px 1px 8px 3px #B3850896',
                  fontFamily: "'Inter Display','Inter',sans-serif",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
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
        <form onSubmit={handleForgotSendOtp} className="w-full flex flex-col min-h-[300px] sm:min-h-[380px]">
          {/* Top content */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password ?</h2>
              <p className="text-sm text-gray-400 mt-1">Please enter your E-mail To verify your account</p>
            </div>

            <div className="space-y-1">
              <label
                style={{
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0em",
                  color: "#374151",
                }}
              >E-mail</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => { setForgotEmail(e.target.value); clearAll(); }}
                placeholder="Enter your email"
                autoFocus
                autoComplete="email"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-300 bg-white transition-all ${
                  errors.forgotEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-purple-300'
                }`}
              />
              {errors.forgotEmail && <p className="text-red-500 text-xs font-medium ml-1">{errors.forgotEmail}</p>}
            </div>

            {submitError && <ErrorBanner msg={submitError} />}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                height: "50px",
                background: "#612178",
                borderRadius: "16px",
                boxShadow: "0px 4px 10px -2px #00000040",
              }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : 'Continue'}
            </button>
          </div>

          {/* Bottom text — pushed to bottom */}
          <p className="text-center text-sm text-gray-500 mt-auto pt-8">
            Don&apos;t Have An Account ?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: "#612178" }}>Sign Up</Link>
          </p>
        </form>
      )}

      {/* ── Step 2: Enter OTP ────────────────────────────────────────── */}
      {forgotStep === 'otp' && (
        <form onSubmit={handleForgotVerifyOtp} className="w-full flex flex-col min-h-[300px] sm:min-h-[380px]">
          <div className="flex flex-col gap-4 flex-1">
            {/* Title — left aligned, matches forgot-email style */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password ?</h2>
              <p className="text-sm text-gray-400 mt-1">Please enter your OTP we have sent to your E-mail</p>
            </div>

            {/* Individual OTP boxes — responsive */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {[0,1,2,3,4,5].map((i) => (
                <input
                  key={i}
                  id={`otp-forgot-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={forgotOtp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const arr = forgotOtp.split('');
                    arr[i] = val.slice(-1);
                    const next = arr.join('').slice(0, 6);
                    setForgotOtp(next);
                    clearAll();
                    if (val && i < 5) {
                      document.getElementById(`otp-forgot-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !forgotOtp[i] && i > 0) {
                      document.getElementById(`otp-forgot-${i - 1}`)?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pastedData) {
                      setForgotOtp(pastedData);
                      clearAll();
                      const focusIndex = Math.min(pastedData.length, 5);
                      document.getElementById(`otp-forgot-${focusIndex}`)?.focus();
                    }
                  }}
                  autoFocus={i === 0}
                  className="w-full aspect-square min-w-0 text-center text-base sm:text-xl font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white transition-all"
                />
              ))}
            </div>

            {errors.forgotOtp && <p className="text-red-500 text-xs font-medium">{errors.forgotOtp}</p>}
            {submitError && <ErrorBanner msg={submitError} />}
            {submitSuccess && <SuccessBanner msg={submitSuccess} />}

            {/* Continue button */}
            <button
              type="submit"
              disabled={isLoading || forgotOtp.length < 6}
              className="w-full text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                height: "50px",
                background: forgotOtp.length === 6 ? "#612178" : "#D9D9D921",
                borderRadius: "16px",
                boxShadow: "0px 4px 10px -2px #00000040",
              }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
              ) : 'Continue'}
            </button>

            {/* Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendResetOtp}
                disabled={resendCooldown > 0}
                className="text-sm font-semibold transition-colors disabled:opacity-40"
                style={{ color: "#612178" }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-sm text-gray-500 mt-auto pt-8">
            Don&apos;t Have An Account ?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: "#612178" }}>Sign Up</Link>
          </p>
        </form>
      )}

      {/* ── Step 3: New password ─────────────────────────────────────── */}
      {forgotStep === 'newPassword' && (
        <form onSubmit={handleUpdatePassword} className="w-full flex flex-col min-h-[300px] sm:min-h-[380px]">
          <div className="flex flex-col gap-4 flex-1">

            {/* Title — left aligned */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password ?</h2>
              <p className="text-sm text-gray-400 mt-1">Set your new password</p>
            </div>

            {/* New password */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' })); }}
                  placeholder="Enter New Password"
                  autoFocus
                  autoComplete="new-password"
                  className="w-full px-4 pr-12 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  style={{
                    height: "52px",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    border: errors.newPassword ? "1px solid #f87171" : "1px solid #F3D1EE",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                placeholder="Confirm New Password"
                autoComplete="new-password"
                className="w-full px-4 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                style={{
                  height: "52px",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: errors.confirmPassword ? "1px solid #f87171" : "1px solid #F3D1EE",
                }}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs font-medium ml-1">{errors.confirmPassword}</p>}
            </div>

            {submitError && <ErrorBanner msg={submitError} />}
            {submitSuccess && <SuccessBanner msg={submitSuccess} />}

            {/* Reset button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                height: "50px",
                background: "#612178",
                borderRadius: "16px",
                boxShadow: "0px 4px 10px -2px #00000040",
              }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
              ) : 'Reset'}
            </button>
          </div>

          {/* Bottom text */}
          <p className="text-center text-sm text-gray-500 mt-auto pt-8">
            Don&apos;t Have An Account ?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: "#612178" }}>Sign Up</Link>
          </p>
        </form>
      )}

      {/* Password reset success modal is now rendered in the custom forgot-password layout. */}
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SigninContent />
    </Suspense>
  );
}