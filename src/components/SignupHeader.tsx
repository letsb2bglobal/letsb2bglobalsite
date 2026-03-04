'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SignupHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
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

          {/* Right: Download app + Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/download"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm transition-all"
              style={{ background: '#612178' }}
            >
              <Image src="/androidLogo.png" alt="" width={20} height={20} />
              Download app
            </Link>
            <Link
              href="/signin"
              className="flex items-center justify-center px-4 py-2 rounded-full text-white font-semibold text-sm transition-all"
              style={{ background: '#FEA40C' }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
