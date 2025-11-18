'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/api/notifications';
import type { Tables } from '@/lib/types/database.types';

type Notification = Tables<'notifications'>;

interface UseNotificationsOptions {
  userId: string | null;
  limit?: number;
  unreadOnly?: boolean;
  enableRealtime?: boolean;
}

export function useNotifications(options: UseNotificationsOptions) {
  const { userId, limit = 20, unreadOnly = false, enableRealtime = true } = options;
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);

  // Query for notifications
  const {
    data: notificationData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', userId, offset, limit, unreadOnly],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getUserNotifications(userId, { limit, offset, unreadOnly });
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Query for unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getUnreadCount(userId);
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Refetch both queries with exact keys
      queryClient.refetchQueries({ 
        queryKey: ['notifications', userId, offset, limit, unreadOnly],
        exact: true 
      });
      queryClient.refetchQueries({ 
        queryKey: ['notifications', 'unread-count', userId],
        exact: true 
      });
    },
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User ID is required');
      return markAllNotificationsAsRead(userId);
    },
    onSuccess: () => {
      // Refetch both queries with exact keys
      queryClient.refetchQueries({ 
        queryKey: ['notifications', userId, offset, limit, unreadOnly],
        exact: true 
      });
      queryClient.refetchQueries({ 
        queryKey: ['notifications', 'unread-count', userId],
        exact: true 
      });
    },
  });

  // Mutation for deleting notification
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      // Refetch both queries with exact keys
      queryClient.refetchQueries({ 
        queryKey: ['notifications', userId, offset, limit, unreadOnly],
        exact: true 
      });
      queryClient.refetchQueries({ 
        queryKey: ['notifications', 'unread-count', userId],
        exact: true 
      });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId || !enableRealtime) return;

    const supabase = createClient();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          
          // Force immediate refetch instead of just invalidating
          queryClient.refetchQueries({ 
            queryKey: ['notifications', userId, offset, limit, unreadOnly],
            exact: true
          });
          queryClient.refetchQueries({ 
            queryKey: ['notifications', 'unread-count', userId],
            exact: true
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enableRealtime, queryClient, offset, limit, unreadOnly]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (notificationData?.hasMore) {
      setOffset(prev => prev + limit);
    }
  }, [notificationData?.hasMore, limit]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setOffset(0);
  }, []);

  // Handle notification click (navigate and mark as read)
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read if unread
      if (!notification.read) {
        try {
          // Mark as read first
          await markAsReadMutation.mutateAsync(notification.id);
          
          // UI will be updated by onSuccess refetch automatically
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          // Don't navigate if marking as read fails
          return;
        }
      }

      // Navigate to link if exists
      if (notification.link) {
        window.location.href = notification.link;
      }
    },
    [markAsReadMutation]
  );

  return {
    notifications: notificationData?.notifications || [],
    hasMore: notificationData?.hasMore || false,
    unreadCount,
    isLoading,
    error,
    loadMore,
    resetPagination,
    refetch,
    handleNotificationClick,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}

/**
 * Hook to check if user has unread notifications
 * Useful for showing badges
 */
export function useUnreadNotificationsCount(userId: string | null) {
  const { data: count = 0, isLoading } = useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => {
      if (!userId) return 0;
      return getUnreadCount(userId);
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  return { count, isLoading };
}