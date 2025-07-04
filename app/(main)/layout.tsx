// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import ClientLayout from '@/components/layout/ClientLayout';
// import useAuthStore from '@/store/auth';
// import { parseCookies } from 'nookies';
// import { useNotificationStore } from '@/store/useNotificationStore';
// import { cookies } from 'next/headers';

// export default function MainLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { isAuthenticated, user } = useAuthStore();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const { fetchRecentNotifications } = useNotificationStore();

//   useEffect(() => {
//     // Check for authentication cookies
//     // const cookies = parseCookies();
//     // console.log("🚀 ~ useEffect ~ cookies:", cookies)
//     // const hasAuthCookie = !!cookies['accessToken']
//     // console.log("🚀 ~ useEffect ~ hasAuthCookie:", hasAuthCookie)
//     const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken');
    
//     // Only redirect if we're sure the store has hydrated and there's no auth
//     if (!isLoading && !isAuthenticated && !accessToken) {
//       router.push('/login');
//     }
    
//     // Fetch recent notifications if authenticated
//     if (isAuthenticated && user) {
//       fetchRecentNotifications();
//     }
    
//     setIsLoading(false);
//   }, [isAuthenticated, router, user, fetchRecentNotifications, isLoading]);

//   // Don't render anything during loading to prevent flash of content
//   if (isLoading) {
//     return null;
//   }

//   return <ClientLayout>{children}</ClientLayout>;
// } 

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from '@/components/layout/ClientLayout';
import ClientMainWrapper from './ClientMainWrapper';


// Server component for initial auth check
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check using httpOnly cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  console.log("🚀 ~ MainLayout ~ accessToken:", accessToken)

  if (!accessToken) {
    redirect('/login');
  }

  // If authenticated, render the client wrapper that handles Zustand state
  return (
    <ClientMainWrapper>
      <ClientLayout>{children}</ClientLayout>
    </ClientMainWrapper>
  );
} 