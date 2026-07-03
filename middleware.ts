/**
 * Next.js Middleware
 * 
 * This runs on EVERY request before reaching your pages/API routes.
 * 
 * What it does:
 * 1. Refreshes Supabase auth tokens automatically
 * 2. Keeps users logged in seamlessly
 * 3. Can protect routes (redirect unauthorized users)
 * 
 * Important: This must be at the project root, not in app/ or lib/
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

/**
 * Kill switch: when ARGUS_DEMO_DOWN is truthy, serve 503 to the monitored
 * app surface so uptime checkers (Argus) see real downtime. Excludes
 * /api so backend/webhook routes keep working while this is flipped on.
 */
function isDemoDown(): boolean {
  const value = (process.env.ARGUS_DEMO_DOWN ?? '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDemoDown() && !pathname.startsWith('/api')) {
    return new NextResponse('down', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

   if (pathname.startsWith('/api/uvcs-webhook')) {
    // Do NOT redirect, just let the request hit the route handler
    return NextResponse.next();
  }

  return await updateSession(request);
}

/**
 * Configure which routes this middleware runs on
 * 
 * Current config: Run on all routes EXCEPT:
 * - _next/static (static files)
 * - _next/image (image optimization)
 * - favicon.ico
 * - Image files (svg, png, jpg, jpeg, gif, webp)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};