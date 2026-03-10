
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { getUser, clearAuthData, isAuthenticated } from "@/lib/auth";
import { useTeam } from "@/context/TeamContext";
import { fetchEnquiryThreads } from "@/lib/enquiry";

// Landing page menu: section anchors (scroll on /) or page links; primary = CTA button style
const LANDING_MENU: {
  label: string;
  href?: string;
  id?: string;
  primary?: boolean;
}[] = [
  { label: "About Us", href: "/aboutus" },
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Why LetsB2B", id: "why-choose-us" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Us", href: "/contact" },
  { label: "Get Started", href: "/signup", primary: true },
];

// Pages that use the landing-style header (dark nav, pill menu)
const LANDING_HEADER_PAGES = [
  "/",
  "/pricing",
  "/aboutus",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/conduct",
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { activeWorkspace } = useTeam();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [scrolledPastLanding, setScrolledPastLanding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Load auth state on client after first render to avoid SSR/client mismatch
  useEffect(() => {
    setUser(getUser());
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // On landing / pricing / aboutus / contact / policy pages: switch header to dark once user scrolls past the hero
  useEffect(() => {
    if (!LANDING_HEADER_PAGES.includes(pathname)) return;
    const check = () =>
      setScrolledPastLanding(window.scrollY >= window.innerHeight);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);

  // On homepage: track which section is in view for nav highlight
  const sectionIds = ["features", "how-it-works", "why-choose-us"];
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSectionId(null);
      return;
    }
    const updateActive = () => {
      const viewportTop = 120;
      let active: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportTop && rect.bottom > 0) active = id;
      }
      setActiveSectionId(active);
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [pathname]);

  // Close mobile menu when navigating or when scrolling past hero on landing
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (LANDING_HEADER_PAGES.includes(pathname) && scrolledPastLanding)
      setMobileMenuOpen(false);
  }, [pathname, scrolledPastLanding]);

  // Lock body scroll when full-page mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const checkNotifications = useCallback(async () => {
    try {
      const threads = await fetchEnquiryThreads();

      const now = new Date();
      const isNew = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return now.getTime() - date.getTime() < 5 * 60 * 1000;
      };

      const hasRecentActivity = threads.some((t) => isNew(t.updatedAt));
      setHasNewNotifications(hasRecentActivity);
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
    router.push("/signin");
  };

  const handleSectionClick = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!isLoggedIn && pathname !== "/signin" && pathname !== "/signup") {
    // Landing & pricing & policy pages: header with logo and pill nav
    if (LANDING_HEADER_PAGES.includes(pathname)) {
      const isPolicyPage = [
        "/privacy",
        "/terms",
        "/cookies",
        "/conduct",
      ].includes(pathname);
      return (
        <header
          className={`sticky top-0 left-0 right-0 z-100 transition-all duration-300 ${
            scrolledPastLanding ||
            pathname === "/pricing" ||
            pathname === "/aboutus" ||
            pathname === "/contact" ||
            isPolicyPage
              ? "bg-[#1a1625] border-b border-white/10"
              : "border-transparent bg-transparent"
          }`}
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 sm:h-20 px-4 sm:px-5 lg:px-10">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0"
            >
              <Image
                src="/letsb2b_logo_white.png"
                alt="LetsB2B - Less Noise, Pure Business"
                width={180}
                height={48}
                className="h-9 w-auto object-contain sm:h-12"
                priority
              />
            </Link>

            {/* Desktop nav: pill with menu links */}
            <nav
              className="hidden md:flex items-center gap-1 rounded-[27px] px-1 py-1.5"
              style={{ background: "#FFFFFF 0% 0% no-repeat padding-box" }}
            >
              {LANDING_MENU.map((item) => {
                const isActive = item.id
                  ? pathname === "/" && activeSectionId === item.id
                  : item.href
                    ? pathname === item.href
                    : false;
                if (item.id) {
                  return pathname === "/" ? (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSectionClick(item.id!)}
                      className={`px-4 py-2.5 text-sm font-bold rounded-[27px] transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-[#6B3FA0] bg-[#6B3FA0]/15"
                          : "text-gray-800 hover:text-[#6B3FA0] hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/#${item.id}`}
                      className={`px-4 py-2.5 text-sm font-bold rounded-[27px] transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-[#6B3FA0] bg-[#6B3FA0]/15"
                          : "text-gray-800 hover:text-[#6B3FA0] hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                if (item.primary) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={`px-5 py-2.5 text-sm font-bold rounded-[27px] transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? "text-white bg-[#5a3590] ring-2 ring-[#6B3FA0] ring-offset-2"
                          : "text-white bg-[#6B3FA0] hover:bg-[#5a3590]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`px-4 py-2.5 text-sm font-bold rounded-[27px] transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "text-[#6B3FA0] bg-[#6B3FA0]/15"
                        : "text-gray-800 hover:text-[#6B3FA0] hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile: hamburger opens full-page pull menu */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Full-page pull menu overlay + panel with close icon */}
          <div
            className={`md:hidden fixed inset-0 z-[110] transition-opacity duration-300 ${
              mobileMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!mobileMenuOpen}
          >
            {/* Backdrop - tap to close */}
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            />
            {/* Slide-in panel from right */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-[#1a1625] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/10">
                <span className="text-white font-bold text-lg">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>
              <nav className="flex flex-col flex-1 py-6 px-4 overflow-auto">
                {LANDING_MENU.map((item) => {
                  const isActive = item.id
                    ? pathname === "/" && activeSectionId === item.id
                    : item.href
                      ? pathname === item.href
                      : false;
                  if (item.id) {
                    return pathname === "/" ? (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSectionClick(item.id!)}
                        className={`px-4 py-3.5 text-left text-base font-bold rounded-xl transition-colors ${
                          isActive
                            ? "text-[#22c55e] bg-white/10"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.id}
                        href={`/#${item.id}`}
                        className={`px-4 py-3.5 text-base font-bold rounded-xl transition-colors ${
                          isActive
                            ? "text-[#22c55e] bg-white/10"
                            : "text-white hover:bg-white/10"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  if (item.primary) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        className={`mt-4 mx-4 py-3.5 text-center text-base font-bold rounded-xl transition-colors ${
                          isActive
                            ? "text-white bg-[#5a3590] ring-2 ring-[#22c55e]"
                            : "text-white bg-[#6B3FA0] hover:bg-[#5a3590]"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={`px-4 py-3.5 text-base font-bold rounded-xl transition-colors ${
                        isActive
                          ? "text-[#22c55e] bg-white/10"
                          : "text-white hover:bg-white/10"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>
      );
    }
    return null;
  }

  const noHeaderPages = ["/signin", "/signup"];
  if (noHeaderPages.includes(pathname)) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-[100] border-b border-gray-200/80 bg-[#FFFFFF] backdrop-blur-xl shadow-lg shadow-black/5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-18 px-5">
        {/* Left Section: Logo + Quick Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/icons/logo.png"
              alt="LetsB2B Logo"
              width={164}
              height={50}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-2 pl-6">
            <Link
              href="/home"
              className={`flex items-center gap-2 px-3.5 py-2 text-[16px] ${
                pathname === "/home" ? "text-[#6B3FA0]" : "text-[#434343]"
              }`}
            >
              {pathname === "/home" && (
                <Image
                  src="/assets/icons/feed.png"
                  alt="Feed"
                  width={14}
                  height={14}
                />
              )}
              <span>Feed</span>
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-2 text-[16px] ${
                pathname === "/" ? "text-[#6B3FA0]" : "text-[#434343]"
              }`}
            >
              {/* {pathname === "/" && (
                <Image
                  src="/assets/icons/network.png"
                  alt="Network"
                  width={14}
                  height={14}
                />
              )} */}
              <span>Network</span>
            </Link>

            <Link
              href="/enquiries"
              className={`flex items-center gap-2 px-3.5 py-2 text-[16px] ${
                pathname === "/enquiries" ? "text-[#6B3FA0]" : "text-[#434343]"
              }`}
            >
              {/* {pathname === "/enquiries" && (
                <Image
                  src="/assets/icons/enquiry.png"
                  alt="Enquiry"
                  width={14}
                  height={14}
                />
              )} */}
              <span>Enquiry</span>
            </Link>

            <Link
              href="/messages"
              className={`flex items-center gap-2 px-3.5 py-2 text-[16px] ${
                pathname === "/messages" ? "text-[#6B3FA0]" : "text-[#434343]"
              }`}
            >
              {/* {pathname === "/messages" && (
                <Image
                  src="/assets/icons/chat.png"
                  alt="Chat"
                  width={14}
                  height={14}
                />
              )} */}
              <span>Chat</span>
            </Link>
          </div>

          {/* Center Section: Search Bar (Premium Design) */}
          <div className="flex-1 max-w-[480px] px-6 hidden md:block">
            <div className="flex items-center bg-[#f8f9fc] rounded-2xl border border-gray-100 shadow-sm focus-within:shadow-md focus-within:border-purple-200 focus-within:bg-white transition-all overflow-hidden h-10 ring-4 ring-transparent focus-within:ring-purple-50">
              <div className="flex-1 flex items-center px-4 gap-2 border-r border-gray-100">
                <Image
                  src="/assets/icons/search.png"
                  alt="Search"
                  width={16}
                  height={16}
                />
                <input
                  type="text"
                  placeholder="Business name or service..."
                  className="bg-transparent border-none outline-none text-[13px] font-semibold w-full placeholder:text-gray-400 text-gray-700"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="flex-[0.7] flex items-center px-4 gap-2">
                <MapPin
                  size={16}
                  className="text-orange-400"
                  strokeWidth={2.5}
                />
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
        </div>

        {/* Right Section: Navigation + User */}
        <div className="flex items-center gap-2 lg:gap-6 shrink-0">
          <div className="flex items-center gap-3 pl-4 lg:pl-6">
            <button
              onClick={checkNotifications}
              className="p-2 text-gray-500 hover:bg-[#f6f2f8] rounded-xl transition-all relative group"
            >
              <Image
                src="/assets/icons/notification.png"
                alt="Feed"
                width={22}
                height={22}
              />
              {hasNewNotifications && (
                <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#6B3FA0] to-[#3a1d63] rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md overflow-hidden">
                    {user?.username?.substring(0, 1).toUpperCase() || "U"}
                  </div>

                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-[14px] font-black leading-none tracking-tight">
                      {activeWorkspace?.data?.company_name ||
                        user?.username ||
                        "Guest"}
                    </span>
                    {/* 
                    <span className="text-[8px] text-[#6B3FA0] font-black uppercase tracking-widest mt-1 opacity-70">
                      {user?.username ? "Verified Pro" : "Sign In"}
                    </span> */}
                  </div>
                </Link>

                {/* Down Arrow */}
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="p-1"
                >
                  <Image
                    src="/assets/icons/down-arrow.svg"
                    alt="menu"
                    width={12}
                    height={12}
                  />
                </button>
              </div>

              {/* Dropdown */}
              {openDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6B3FA0]"
                  >
                    My Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6B3FA0]"
                  >
                    Settings
                  </Link>

                  <div className="h-px bg-gray-50 my-1 mx-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavItem = ({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) => (
  <Link
    href={href}
    className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative group ${active ? "text-[#6B3FA0]" : "text-gray-400 hover:text-[#6B3FA0] hover:bg-[#f6f2f8]"}`}
  >
    <div
      className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}
    >
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
      {label}
    </span>
    {active && (
      <div className="absolute -bottom-1 w-6 h-[3px] bg-[#6B3FA0] rounded-full shadow-sm shadow-purple-200"></div>
    )}
  </Link>
);

export default Header;
