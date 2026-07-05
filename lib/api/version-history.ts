// lib/api/version-history.ts
import { createClient } from '@/lib/supabase/client';
import { logger } from '../logger';

export type VersionEventType = 'checkin' | 'merge' | 'delete' | string;

export interface VersionEvent {
  id: string;
  created_at: string;
  event_type: VersionEventType;
  repo_name: string | null;
  branch_name: string | null;
  author: string | null;
  comment: string | null;
  changeset_number: string | null;
  merge_source: string | null;
  merge_destination: string | null;
  has_conflicts: boolean | null;
  // Resolved from `profiles` by matching the author's email. Null when no
  // profile matches — we deliberately do not fall back to the raw email.
  author_name: string | null;
  author_initials: string | null;
}

export async function getVersionHistory(
  limit: number = 50
): Promise<VersionEvent[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('uvcs_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('getVersionHistory error', error);
      throw error;
    }

    const events = data ?? [];

    // Map author emails to profile usernames so we never render raw emails.
    const emails = [
      ...new Set(
        events
          .map((e) => e.author)
          .filter((a): a is string => !!a)
          .map((a) => a.toLowerCase())
      ),
    ];

    const profileByEmail = new Map<string, { username: string; initials: string }>();
    if (emails.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('email, username, initials')
        .in('email', emails);

      if (profilesError) {
        // Non-fatal: fall through with no names rather than breaking the feed.
        logger.error('getVersionHistory profiles lookup error', profilesError);
      } else {
        for (const p of profiles ?? []) {
          if (p.email) {
            profileByEmail.set(p.email.toLowerCase(), {
              username: p.username,
              initials: p.initials,
            });
          }
        }
      }
    }

    return events.map((e) => {
      const match = e.author ? profileByEmail.get(e.author.toLowerCase()) : undefined;
      return {
        ...e,
        author_name: match?.username ?? null,
        author_initials: match?.initials ?? null,
      };
    });
  } catch (err) {
    logger.error('getVersionHistory unhandled error', err);
    throw err;
  }
}