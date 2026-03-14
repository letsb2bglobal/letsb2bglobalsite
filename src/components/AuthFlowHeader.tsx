'use client';

import Image from 'next/image';
import Link from 'next/link';

/** Header for signup/onboarding flow: logo on black (left), Download App + Log In on white (right). Matches signin page button styles. */
export default function AuthFlowHeader() {
  return (
    <header className="flex-shrink-0 w-full flex items-stretch min-h-[64px] sm:min-h-[72px]">
      {/* Logo — black section, rounded left corners */}
      <div className="flex items-center pl-4 pr-3 sm:px-6 lg:px-8 py-3 sm:py-4 bg-[#05020F] rounded-l-2xl sm:rounded-l-3xl min-w-0 shrink-0">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Image
            src="/assets/icons/b2blogofinal.png"
            alt="LetsB2B"
            width={140}
            height={40}
            className="h-7 w-auto sm:h-9 object-contain object-left shrink-0"
          />
          <span className="hidden sm:inline text-xs text-gray-400 whitespace-nowrap">
            Less Noise. Pure Business.
          </span>
        </Link>
      </div>

      {/* Buttons — white section, same as signin page */}
      <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <Link
          href="/download"
          className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-colors shrink-0"
          style={{ background: '#9747FF' }}
        >
          <Image
            src="/assets/icons/android.png"
            alt=""
            width={18}
            height={18}
            className="object-contain shrink-0"
          />
          <span>Download App</span>
        </Link>
        <Link
          href="/signin"
          className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold shrink-0"
          style={{ background: '#FEA40C9C', color: 'var(--Background-Colour, #FFFFFF)' }}
        >
          Log In
        </Link>
      </div>
    </header>
  );
}
