// import { redirect } from 'next/navigation';
// import { cookies } from 'next/headers';  
import ClientLayout from '@/components/layout/ClientLayout';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated by checking for accessToken cookie
  // AUTHENTICATION TEMPORARILY DISABLED
  // const cookieStore = await cookies();
  // const accessToken = cookieStore.get('accessToken');
  
  // if (!accessToken) {
  //   redirect('/login');
  // }

  return <ClientLayout>{children}</ClientLayout>;
} 