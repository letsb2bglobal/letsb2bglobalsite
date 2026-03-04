'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SignupHeader from './SignupHeader';

const AUTH_PATHS = ['/signin', '/signup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));
  const isSignupPage = pathname?.startsWith('/signup');

  return (
    <div className={`flex flex-col min-h-screen ${isSignupPage ? "h-screen overflow-hidden" : ""}`}>
      {isSignupPage ? <SignupHeader /> : !isAuthPage && <Header />}
      <main className={`flex-grow ${isSignupPage ? "min-h-0 overflow-hidden" : ""}`}>{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
