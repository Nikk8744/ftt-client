import { useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth';
import { parseCookies } from 'nookies';

export function useNotifications() {
  const { isAuthenticated, user } = useAuthStore();
  const { initializeSocket, cleanup, fetchRecentNotifications } = useNotificationStore();

  useEffect(() => {
    // Only initialize if authenticated
    if (isAuthenticated && user) {
      // Get token from cookies (where it's actually stored)
      const cookies = parseCookies();
      const token = cookies['accessToken'] || cookies['auth-token'] || '';
      
      if (token) {
        console.log('Initializing notification socket with token');
        initializeSocket(token);
        
        // Also fetch recent notifications to ensure we have both read and unread
        fetchRecentNotifications();
      } else {
        console.error('No authentication token available in cookies');
      }
    }

    // Clean up on unmount or when auth state changes
    return () => {
      cleanup();
    };
  }, [isAuthenticated, user, initializeSocket, cleanup, fetchRecentNotifications]);

  // Return the store for convenience
  return useNotificationStore;
} 