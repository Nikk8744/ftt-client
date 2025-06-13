'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/layout/ClientLayout';
import useAuthStore from '@/store/auth';
import { parseCookies } from 'nookies';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { fetchRecentNotifications } = useNotificationStore();

  useEffect(() => {
    // Check for authentication cookies
    const cookies = parseCookies();
    const hasAuthCookie = !!cookies['accessToken'] || !!cookies['auth-token'];
    
    // Only redirect if we're sure the store has hydrated and there's no auth
    if (!isLoading && !isAuthenticated && !hasAuthCookie) {
      router.push('/login');
    }
    
    // Fetch recent notifications if authenticated
    if (isAuthenticated && user) {
      fetchRecentNotifications();
    }
    
    setIsLoading(false);
  }, [isAuthenticated, router, user, fetchRecentNotifications, isLoading]);

  // Don't render anything during loading to prevent flash of content
  if (isLoading) {
    return null;
  }

  return <ClientLayout>{children}</ClientLayout>;
} 