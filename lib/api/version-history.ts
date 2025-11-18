// lib/api/version-history.ts
import { createClient } from '@/lib/supabase/client';

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

export async function getVersionHistory(limit = 50): Promise<VersionEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('uvcs_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getVersionHistory error', error);
    throw error;
  }

  return (data ?? []) as VersionEvent[];
}
