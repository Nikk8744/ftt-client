import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Array of paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/'];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );
// Get the token from cookies
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;

  // If the user is on a protected path but not authenticated, redirect to login
  // if (!isPublicPath && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  // if (!isPublicPath && !isAuthenticated) {
  //   // Use NextResponse.redirect with { redirect: 'manual' } to prevent full page refresh
  //   const url = new URL('/login', request.url);
  //   return NextResponse.redirect(url);
  // }

  // If the user is authenticated but tries to access login/register, redirect to dashboard
  if (isAuthenticated && isPublicPath &&
      (request.nextUrl.pathname === '/login' || 
       request.nextUrl.pathname === '/register')) {
    // return NextResponse.redirect(new URL('/dashboard', request.url));
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 