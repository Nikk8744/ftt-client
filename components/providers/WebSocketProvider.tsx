'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth';

/**
 * WebSocketProvider initializes and manages the WebSocket connection
 * for real-time notifications and timer events
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { initializeSocket, cleanup } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once when user is authenticated
    if (isAuthenticated && !hasInitialized.current) {
      console.log('[WebSocketProvider] Initializing WebSocket connection');
      initializeSocket();
      hasInitialized.current = true;
    }

    // Cleanup on unmount or when user logs out
    return () => {
      if (hasInitialized.current) {
        console.log('[WebSocketProvider] Cleaning up WebSocket connection');
        cleanup();
        hasInitialized.current = false;
      }
    };
  }, [isAuthenticated, initializeSocket, cleanup]);

  return <>{children}</>;
}
