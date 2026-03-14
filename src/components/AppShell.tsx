'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SignupHeader from './SignupHeader';

const AUTH_PATHS = ['/signin', '/signup'];

const SIGNUP_HEADER_PATHS = ['/signup', '/complete-profile', '/add-additional-details'];

/** Pages that provide their own header/footer layout (e.g. complete-profile) */
const SELF_LAYOUT_PATHS = ['/complete-profile', '/add-additional-details'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));
  const isSignupPage = pathname?.startsWith('/signup');
  const isSignupHeaderPage = SIGNUP_HEADER_PATHS.some((p) => pathname?.startsWith(p)) && !isSignupPage;
  const hasSelfLayout = SELF_LAYOUT_PATHS.some((p) => pathname?.startsWith(p));

  if (hasSelfLayout) {
    return <>{children}</>;
  }

  const showHeader = isSignupHeaderPage ? <SignupHeader /> : !isAuthPage && <Header />;
  const showFooter = !isAuthPage && <Footer />;

  return (
    <div className={`flex flex-col min-h-screen ${isSignupPage ? "h-screen overflow-hidden" : ""}`}>
      {showHeader}
      <main
        className={`flex-grow min-h-0 ${
          isAuthPage ? "bg-[#05020F]" : ""
        } ${isSignupPage ? "overflow-hidden" : ""}`}
      >
        {children}
      </main>
      {showFooter && <div className="flex-shrink-0">{showFooter}</div>}
    </div>
  );
}
