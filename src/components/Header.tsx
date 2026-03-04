'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Home, 
  Users, 
  FileText, 
  BarChart2,
  LogOut,
  MapPin
} from 'lucide-react';
import { getUser, clearAuthData, isAuthenticated } from '@/lib/auth';
import { useTeam } from '@/context/TeamContext';
import { fetchEnquiryThreads } from '@/lib/enquiry';
import { fetchUserConversations } from '@/lib/messages';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useState<any>(() => {
    if (typeof window !== 'undefined') return getUser();
    return null;
  });
  const [isLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return isAuthenticated();
    return false;
  });
  const { activeWorkspace } = useTeam();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");

  const checkNotifications = useCallback(async () => {
    try {
      const threads = await fetchEnquiryThreads();
      const conversations = await fetchUserConversations();
      
      const now = new Date();
      const isNew = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return (now.getTime() - date.getTime()) < 5 * 60 * 1000;
      };

      const hasRecentEnquiry = threads.some(t => isNew(t.updatedAt));
      const hasRecentChat = conversations.some(c => isNew(c.updatedAt));

      setHasNewNotifications(hasRecentEnquiry || hasRecentChat);
    } catch (err) {
      console.error("Notification check failed", err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      checkNotifications();
    }
  }, [user, checkNotifications]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/signin');
  };

  if (!isLoggedIn && pathname !== '/signin' && pathname !== '/signup') {
    return null;
  }

  const noHeaderPages = ['/signin', '/signup'];
  if (noHeaderPages.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 px-5 gap-4">
        {/* Left Section: Logo + Quick Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#6B3FA0] to-[#8E54D7] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-black text-xl tracking-tighter italic">B</span>
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#6B3FA0] to-gray-800 tracking-tight hidden sm:block">
              LetsB2B
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-2 border-l border-gray-100 pl-6 space-x-1">
             <Link href="/messages" className="flex items-center gap-2 px-3.5 py-2 bg-[#f6f2f8] text-[#6B3FA0] rounded-xl text-xs font-bold hover:bg-[#6B3FA0] hover:text-white transition-all transform active:scale-95">
                <MessageSquare size={14} strokeWidth={2.5} />
                <span>Chat</span>
             </Link>
             <Link href="/enquiries" className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all transform active:scale-95">
                <Bell size={14} strokeWidth={2.5} />
                <span>Enquiry</span>
             </Link>
          </div>
        </div>

        {/* Center Section: Search Bar (Premium Design) */}
        <div className="flex-1 max-w-2xl px-4 hidden md:block">
          <div className="flex items-center bg-[#f8f9fc] rounded-2xl border border-gray-100 shadow-sm focus-within:shadow-md focus-within:border-purple-200 focus-within:bg-white transition-all overflow-hidden h-10 ring-4 ring-transparent focus-within:ring-purple-50">
            <div className="flex-1 flex items-center px-4 gap-2 border-r border-gray-100">
               <Search size={16} className="text-[#6B3FA0]" strokeWidth={2.5} />
               <input 
                type="text" 
                placeholder="Business name or service..." 
                className="bg-transparent border-none outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-700"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
               />
            </div>
            <div className="flex-[0.7] flex items-center px-4 gap-2">
               <MapPin size={16} className="text-orange-400" strokeWidth={2.5} />
               <input 
                type="text" 
                placeholder="Destination..." 
                className="bg-transparent border-none outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-700"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
               />
            </div>
            <button className="bg-[#6B3FA0] h-full px-5 text-white hover:bg-black transition-colors">
               <Search size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Right Section: Navigation + User */}
        <div className="flex items-center gap-2 lg:gap-6 shrink-0">
          <nav className="hidden lg:flex items-center gap-1">
            <NavItem href="/home" icon={<Home size={20} />} label="Feed" active={pathname === '/home'} />
            <NavItem href="/" icon={<Users size={20} />} label="Network" active={pathname === '/'} />
            <NavItem href="/enquiries" icon={<FileText size={20} />} label="Enquiry" active={pathname === '/enquiries'} />
          </nav>

          <div className="flex items-center gap-3 border-l border-gray-100 pl-4 lg:pl-6">
             <button onClick={checkNotifications} className="p-2 text-gray-500 hover:bg-[#f6f2f8] rounded-xl transition-all relative group">
                <Bell size={22} strokeWidth={2} />
                {hasNewNotifications && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>}
             </button>
             
             <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

             <div className="relative group/user">
               <Link href="/profile" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#6B3FA0] to-[#3a1d63] rounded-xl flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md overflow-hidden transform group-hover/user:scale-105 transition-transform">
                     {user?.username?.substring(0, 1).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                     <span className="text-[12px] font-black text-gray-800 leading-none tracking-tight">
                        {activeWorkspace?.data?.company_name || user?.username || 'Guest'}
                     </span>
                     <span className="text-[10px] text-[#6B3FA0] font-black uppercase tracking-widest mt-1 opacity-70">
                        {user?.username ? 'Verified Pro' : 'Sign In'}
                     </span>
                  </div>
               </Link>
               
               {/* Quick Dropdown Placeholder/Hint */}
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all transform origin-top-right scale-95 group-hover/user:scale-100 z-[100]">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6B3FA0]">
                     <Users size={16} /> My Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6B3FA0]">
                     <BarChart2 size={16} /> Settings
                  </Link>
                  <div className="h-px bg-gray-50 my-1 mx-2"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50">
                     <LogOut size={16} /> Logout
                  </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <Link href={href} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative group ${active ? 'text-[#6B3FA0]' : 'text-gray-400 hover:text-[#6B3FA0] hover:bg-[#f6f2f8]'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
    {active && <div className="absolute -bottom-1 w-6 h-[3px] bg-[#6B3FA0] rounded-full shadow-sm shadow-purple-200"></div>}
  </Link>
);

export default Header;
