// lib/api/events.ts
import { createClient } from '@/lib/supabase/client';

export type EventPriority = 'low' | 'medium' | 'high';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;          // ISO date (YYYY-MM-DD)
  location: string | null;
  priority: EventPriority;
  created_at: string;
  created_by: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;          // ISO date (YYYY-MM-DD)
  location?: string;
  priority: EventPriority;
}

/**
 * Lazy cleanup + fetch upcoming events (>= today, ordered by date ASC)
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = createClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Lazy job: delete past events on read
  await supabase.from('events').delete().lt('date', todayStr);

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', todayStr)
    .order('date', { ascending: true });

  if (error) {
    console.error('getUpcomingEvents error', error);
    throw error;
  }

  return (data ?? []) as Event[];
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const supabase = createClient();

  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id ?? null;

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      location: input.location ?? null,
      priority: input.priority,
      created_by: userId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('createEvent error', error);
    throw error;
  }

  return data as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('deleteEvent error', error);
    throw error;
  }
}
