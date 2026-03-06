'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/ProtectedRoute';
import { getUser, getProfileData, isAuthenticated, clearAuthData } from '@/lib/auth';

const PURPLE = '#612178';
const PURPLE_LIGHT = '#E0CCF0';
const ORANGE = '#FEA40C';

const ACCOUNT_LINKS = [
  { name: 'Subscription', href: '/pricing' },
  { name: 'Settings & Privacy', href: '/privacy' },
  { name: 'Post & Activity', href: '/' },
  { name: 'Job Posting Account', href: '/profile' },
];

export default function SignupHeader({ sticky = true }: { sticky?: boolean }) {
  const router = useRouter();
  const user = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loggedIn = typeof window !== 'undefined' ? isAuthenticated() : !!user;
  const currentUser = user ?? (typeof window !== 'undefined' ? getUser() : null);
  const profileData = typeof window !== 'undefined' ? getProfileData() : null;

  const displayName = profileData?.company_name || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  const displayEmail = currentUser?.email || profileData?.email || '';
  const initial = (displayName || 'N').charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearAuthData();
    setDropdownOpen(false);
    router.push('/signin');
  };

  return (
    <header className={`z-50 bg-white border-b border-gray-100 shadow-sm ${sticky ? 'sticky top-0' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/headerB2B_logo.png"
              alt="LetsB2B"
              width={120}
              height={32}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Right: Download app + Login or Profile dropdown */}
          <div className="flex items-center gap-3">
            <Link
              href="/download"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm transition-all"
              style={{ background: PURPLE }}
            >
              <Image src="/androidLogo.png" alt="" width={20} height={20} />
              Download App
            </Link>

            {loggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: ORANGE }}
                  >
                    {initial}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-900" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Profile section */}
                    <div className="px-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ backgroundColor: ORANGE }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-sm truncate" style={{ color: PURPLE }}>{displayEmail}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full py-2.5 px-4 rounded-full font-semibold text-sm text-center transition-all"
                        style={{ backgroundColor: PURPLE_LIGHT, color: PURPLE }}
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* Account section */}
                    <div className="px-2 pt-3">
                      <p className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Account</p>
                      {ACCOUNT_LINKS.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-800 font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                          {link.name}
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </Link>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="px-4 pt-2 mt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg px-3 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center justify-center px-4 py-2 rounded-full text-white font-semibold text-sm transition-all"
                style={{ background: ORANGE }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
