'use client';

import { useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/auth';

/**
 * Logout Button Component
 * 
 * Usage:
 * import LogoutButton from '@/components/LogoutButton';
 * 
 * <LogoutButton />
 * // or with custom styling
 * <LogoutButton className="custom-class" />
 */
interface LogoutButtonProps {
  className?: string;
  redirectTo?: string;
}

export default function LogoutButton({ 
  className = '',
  redirectTo = '/signin' 
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication cookies
    clearAuthData();
    
    // Redirect to signin page
    router.push(redirectTo);
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"}
    >
      Logout
    </button>
  );
}
