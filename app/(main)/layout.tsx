'use client';

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import ClientLayout from '@/components/layout/ClientLayout';
import useAuthStore from '@/store/auth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('auth-token');
    
    if (!isAuthenticated && !token) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return <ClientLayout>{children}</ClientLayout>;
} 