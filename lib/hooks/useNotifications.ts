import { useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const { initializeSocket, cleanup, fetchRecentNotifications } = useNotificationStore();
  
  useEffect(() => {
    // Only initialize if authenticated
    if (isAuthenticated) {
      console.log('Initializing notification socket');
      initializeSocket();
      fetchRecentNotifications();
    }

    // Clean up on unmount or when auth state changes
    return () => {
      cleanup();
    };
  }, [isAuthenticated, initializeSocket, cleanup, fetchRecentNotifications]);

  // Return the store for convenience
  return useNotificationStore;
} 