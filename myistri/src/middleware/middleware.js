import { NextResponse } from 'next/server';
import { AUTH_TOKEN_KEY } from './lib/constants'; // Import the auth token key

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const isLoggedIn = !!request.cookies.get(AUTH_TOKEN_KEY)?.value; // Get the token value
  const path = request.nextUrl.pathname;

  // Define paths that don't require authentication (public routes)
  const publicPaths = ['/login', '/register']; // Add other public paths as needed

  if (!isLoggedIn && !publicPaths.includes(path)) {
    // Redirect to login if not logged in and not on a public route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next(); // Continue to the requested page if authenticated or on a public route
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static assets)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|favicon.ico).*)',
  ],
};