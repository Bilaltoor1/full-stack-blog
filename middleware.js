import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request (e.g. /dashboard, /posts/slug, etc.)
  const { pathname } = request.nextUrl;

  // List of paths that should redirect to home on direct access
  const protectedPaths = ['/dashboard'];
  const publicPaths = ['/posts/', '/category/', '/search', '/login', '/register'];

  // Don't redirect API routes, _next static files, or public assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if it's a protected dashboard route
  if (pathname.startsWith('/dashboard')) {
    // For dashboard routes, let them proceed (auth will be handled by the component)
    return NextResponse.next();
  }

  // For all other routes, let them proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
