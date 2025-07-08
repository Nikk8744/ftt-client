"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/layout/ClientLayout";
import useAuthStore from "@/store/auth";
import { parseCookies } from "nookies";
import { useNotificationStore } from "@/store/useNotificationStore";
// import { ThemeProvider } from "@/components/theme-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { fetchRecentNotifications } = useNotificationStore();

  useEffect(() => {
    // Check for authentication cookies
    const cookies = parseCookies();
    // console.log("🚀 ~ useEffect ~ cookies:", cookies);
    const hasAuthCookie = !!cookies["accessToken"];
    // console.log("🚀 ~ useEffect ~ hasAuthCookie:", hasAuthCookie);

    // Let middleware handle the redirect, we just won't render content
    // This prevents double redirects and refreshes
    if (!isAuthenticated && !hasAuthCookie) {
      router.push("/login");
      // setIsLoading(false);
      // return; // Don't proceed further
    }

    // Fetch recent notifications if authenticated
    if (isAuthenticated && user) {
      fetchRecentNotifications();
    }

    setIsLoading(false);
  }, [isAuthenticated, user, fetchRecentNotifications, router]);

  // Don't render anything during loading to prevent flash of content
  if (isLoading) {
    return null;
  }

  // If not authenticated, show a minimal loading state
  // The middleware will handle the actual redirect
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <ClientLayout>
      {/* <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      > */}
        {children}
      {/* </ThemeProvider> */}
    </ClientLayout>
  );
}
