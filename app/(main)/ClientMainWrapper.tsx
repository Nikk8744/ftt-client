'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function ClientMainWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  console.log("🚀 ~ ClientMainWrapper ~ isAuthenticated:", isAuthenticated)
  const { fetchRecentNotifications } = useNotificationStore();
  const router = useRouter();
  
  useEffect(() => {
    // Double-check authentication on the client side
    // This handles cases where the cookie exists but Zustand state is not authenticated
    if (!isAuthenticated) {
      router.push('/');
    }
    
    // Fetch recent notifications if authenticated
    if (isAuthenticated && user) {
      fetchRecentNotifications();
    }
  }, [isAuthenticated, user, fetchRecentNotifications, router]);

  // If not authenticated, don't render children
//   if (!isAuthenticated) {
//     return null;
//   }

  return <>{children}</>;
} 