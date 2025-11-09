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

import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
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