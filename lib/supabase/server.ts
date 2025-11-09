/**
 * Supabase Client for Server (Server Components, API Routes, Server Actions)
 * 
 * Use this client in:
 * - Server Components (default in App Router)
 * - API Route Handlers (app/api/ * /route.ts)
 * - Server Actions
 * 
 * Security: 
 * - Uses cookies for auth state
 * - Respects Row Level Security (RLS) policies
 * - Can access user session server-side
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  // Get cookies from Next.js
  const cookieStore = await cookies();

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Get all cookies
        getAll() {
          return cookieStore.getAll();
        },
        // Set cookies (for auth)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client with Service Role Key (ADMIN ACCESS)
 * 
 * WARNING: This bypasses Row Level Security!
 * Only use for:
 * - Admin operations
 * - Background jobs
 * - System-level tasks
 * 
 * NEVER expose this client to the browser!
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() { return []; },
        setAll() { },
      },
    }
  );
}