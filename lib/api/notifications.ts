
import { createClient } from '@/lib/supabase/client';
import type {
  Database,
  TablesInsert,
  Tables,
} from '@/lib/types/database.types';
import { logger } from '../logger';

type Notification = Tables<'notifications'>;
type NotificationInsert = TablesInsert<'notifications'>;
type NotificationType = Database['public']['Enums']['notification_type'];
type NotificationPriority = Database['public']['Enums']['notification_priority'];

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  priority?: NotificationPriority;
  issue_id?: string | null;
  task_id?: string | null;
  board_id?: string | null;
  scenario_id?: string | null;
  activity_id?: string | null;
  send_email?: boolean;
  send_discord?: boolean;
  show_in_app?: boolean;
}

export interface NotificationWithProfile extends Notification {
  profile?: {
    username: string;
    initials: string;
    avatar_url: string | null;
  };
}

/**
 * Create a single notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const supabase = createClient();

  const notificationData: NotificationInsert = {
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link || null,
    priority: input.priority || 'normal',
    issue_id: input.issue_id || null,
    task_id: input.task_id || null,
    board_id: input.board_id || null,
    scenario_id: input.scenario_id || null,
    activity_id: input.activity_id || null,
    send_email: input.send_email !== undefined ? input.send_email : true,
    send_discord: input.send_discord !== undefined ? input.send_discord : true,
    show_in_app: input.show_in_app !== undefined ? input.show_in_app : true,
    read: false,
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();

  if (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }

  return data;
}

/**
 * Create notifications for multiple users (batch)
 * Returns array of created notifications
 */
export async function createNotificationsForUsers(
  userIds: string[],
  baseInput: Omit<CreateNotificationInput, 'user_id'>
): Promise<Notification[]> {
  const supabase = createClient();

  const notifications: NotificationInsert[] = userIds.map((userId) => ({
    user_id: userId,
    type: baseInput.type,
    title: baseInput.title,
    message: baseInput.message,
    link: baseInput.link || null,
    priority: baseInput.priority || 'normal',
    issue_id: baseInput.issue_id || null,
    task_id: baseInput.task_id || null,
    board_id: baseInput.board_id || null,
    scenario_id: baseInput.scenario_id || null,
    activity_id: baseInput.activity_id || null,
    send_email: baseInput.send_email !== undefined ? baseInput.send_email : true,
    send_discord: baseInput.send_discord !== undefined ? baseInput.send_discord : true,
    show_in_app: baseInput.show_in_app !== undefined ? baseInput.show_in_app : true,
    read: false,
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    logger.error('Error creating batch notifications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get user notifications with pagination
 * @param userId - User ID to fetch notifications for
 * @param limit - Number of notifications to fetch (default 20)
 * @param offset - Offset for pagination (default 0)
 * @param unreadOnly - Only fetch unread notifications (default false)
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<{ notifications: Notification[]; hasMore: boolean }> {
  const supabase = createClient();
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('show_in_app', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error('Error fetching notifications:', error);
    throw error;
  }

  return {
    notifications: data || [],
    hasMore: count ? count > offset + limit : false,
  };
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
    .eq('show_in_app', true);

  if (error) {
    logger.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a single notification as read (permanent - no toggle back)
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('read', false); // Only update if currently unread

  if (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    logger.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all read notifications older than specified days
 * Used for automatic cleanup
 */
export async function deleteOldNotifications(
  userId: string,
  daysOld: number = 30
): Promise<number> {
  const supabase = createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('read', true)
    .lt('created_at', cutoffDate.toISOString())
    .select('id');

  if (error) {
    logger.error('Error deleting old notifications:', error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Get notifications pending Discord send
 * Used by background job to process Discord notifications
 */
export async function getPendingDiscordNotifications(
  limit: number = 10
): Promise<NotificationWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profile:profiles!notifications_user_id_fkey (
        username,
        initials,
        avatar_url,
        discord_id
      )
    `)
    .eq('send_discord', true)
    .is('discord_sent_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error('Error fetching pending Discord notifications:', error);
    throw error;
  }

  return (data || []) as unknown as NotificationWithProfile[];
}

/**
 * Mark notification as sent to Discord
 */
export async function markDiscordSent(notificationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ discord_sent_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    logger.error('Error marking Discord as sent:', error);
    throw error;
  }
}

/**
 * Get notifications pending email send
 * Used by background job to process email notifications
 */
export async function getPendingEmailNotifications(
  limit: number = 10
): Promise<NotificationWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profile:profiles!notifications_user_id_fkey (
        username,
        email,
        initials
      )
    `)
    .eq('send_email', true)
    .is('email_sent_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error('Error fetching pending email notifications:', error);
    throw error;
  }

  return (data || []) as unknown as NotificationWithProfile[];
}

/**
 * Mark notification as sent via email
 */
export async function markEmailSent(notificationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    logger.error('Error marking email as sent:', error);
    throw error;
  }
}