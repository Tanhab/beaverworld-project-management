import { isAuthError } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Convert a thrown value into a message that is safe to show to a user.
 *
 * Supabase Auth errors are written for end users (e.g. "Invalid login
 * credentials", "New password should be different from the old password"), so
 * they pass through. Everything else — Postgres/PostgREST errors especially —
 * is hidden behind `fallback` so we never leak schema names, constraints, or
 * other internals into the UI. The raw error is always logged.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  logger.error(fallback, error);

  if (isAuthError(error) && typeof error.message === 'string' && error.message) {
    return error.message;
  }

  return fallback;
}
