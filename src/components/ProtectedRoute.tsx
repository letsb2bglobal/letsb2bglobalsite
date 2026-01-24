'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, type User } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * HOC component to protect routes that require authentication
 * Wraps your page components to ensure only authenticated users can access them
 * 
 * Usage:
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Your protected content here</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated()) {
      router.push(redirectTo);
    } else {
      setUser(getUser());
      setIsLoading(false);
    }
  }, [router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}

/**
 * Hook to get the current authenticated user
 * Returns null if not authenticated
 * 
 * Usage:
 * const user = useAuth();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 */
export function useAuth(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
