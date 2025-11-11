/**
 * Supabase Client for Browser (Client Components)
 * 
 * Use this client in:
 * - Client Components ("use client")
 * - Real-time subscriptions
 * - Client-side data fetching with TanStack Query
 * 
 * Security: Respects Row Level Security (RLS) policies
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/database.types';

export function createClient() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
