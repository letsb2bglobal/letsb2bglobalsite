'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Home, 
  MessageSquare, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  Search,
  ChevronDown,
  Bell
} from 'lucide-react';
import { getUser, clearAuthData, isAuthenticated } from '@/lib/auth';
import { useTeam } from '@/context/TeamContext';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { fetchEnquiryThreads } from '@/lib/enquiry';
import { fetchUserConversations } from '@/lib/messages';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeWorkspace } = useTeam();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setIsLoggedIn(isAuthenticated());
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Initial check
    if (currentUser?.id) {
      checkNotifications(currentUser.id);
    }

    /* Notification polling removed per user request */
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkNotifications = async (userId: number) => {
    try {
      const threads = await fetchEnquiryThreads();
      const conversations = await fetchUserConversations();
      
      // Look for any enquiry with unread_count (if backend provides it)
      // or just any item updated in the last 5 minutes as a heuristic for "new"
      const now = new Date();
      const isNew = (dateStr: string) => {
        const date = new Date(dateStr);
        return (now.getTime() - date.getTime()) < 5 * 60 * 1000; // 5 mins
      };

      const hasRecentEnquiry = threads.some(t => isNew(t.updatedAt));
      const hasRecentChat = conversations.some(c => isNew(c.updatedAt));

      setHasNewNotifications(hasRecentEnquiry || hasRecentChat);
    } catch (err) {
      console.error("Notification check failed", err);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    router.push('/signin');
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chat', href: '/messages', icon: MessageSquare }, // Chat focused
    { name: 'Enquiries', href: '/enquiries', icon: Bell },     // Formal Enquiry focused
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
  ];

  if (!isLoggedIn && pathname !== '/signin' && pathname !== '/signup') {
    return null; // Don't show header if not logged in and not on auth pages
  }

  // Define pages where header shouldn't appear
  const noHeaderPages = ['/signin', '/signup'];
  if (noHeaderPages.includes(pathname)) return null;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-3xl italic tracking-tighter">L</span>
              <span className="font-bold text-gray-900 hidden md:block uppercase tracking-tight text-lg">
                Let's B2B
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex flex-col items-center px-4 py-1 rounded-lg transition-all group ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <WorkspaceSwitcher />
            
            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-2">
              {/* Notification Icon */}
              <Link 
                href="/messages" 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {hasNewNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm relative">
                  {user?.username?.substring(0, 2).toUpperCase()}
                  {hasNewNotifications && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 leading-tight">
                    {activeWorkspace?.data?.company_name || user?.username || 'Me'}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">View Profile</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <Link 
                href="/messages" 
                className="p-2 text-gray-400 hover:text-blue-600 relative"
              >
                <Bell className="w-6 h-6" />
                {hasNewNotifications && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 font-bold"
              >
                <UserIcon className="w-5 h-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-bold"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
            <div className="mt-4 px-4">
              <WorkspaceSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
