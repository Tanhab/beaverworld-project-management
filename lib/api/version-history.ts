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
}

export async function getVersionHistory(
  limit: number = 50
): Promise<VersionEvent[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('uvcs_events')
      .select('id, created_at, event_type, repo_name, branch_name, author, comment')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('getVersionHistory error', error);
      throw error;
    }

    return (data ?? []) as VersionEvent[];
  } catch (err) {
    logger.error('getVersionHistory unhandled error', err);
    throw err;
  }
}
