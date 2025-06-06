import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Array of paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/'];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Get the token from cookies
  // According to the API guide, the backend sets 'accessToken' and 'refreshToken' cookies
  const token = request.cookies.get('accessToken')?.value;
  // Fallback to our custom cookie if needed
  const customToken = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!(token || customToken);

  // If the user is on a protected path but not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated but tries to access login/register, redirect to dashboard
  if (isAuthenticated && isPublicPath && 
      (request.nextUrl.pathname === '/login' || 
       request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files, images, etc.
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}; 