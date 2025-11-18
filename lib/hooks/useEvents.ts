// lib/hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getUpcomingEvents,
  createEvent,
  deleteEvent,
  type CreateEventInput,
  type Event,
} from '@/lib/api/events';

export function useEvents() {
  return useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: getUpcomingEvents,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create event', {
        description: error.message,
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete event', {
        description: error.message,
      });
    },
  });
}
