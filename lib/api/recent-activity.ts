// lib/api/recent-activity.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database.types';
import { logger } from '../logger';

type ActivityType = 
  | 'issue_created'
  | 'issue_updated'
  | 'issue_closed'
  | 'issue_reopened'
  | 'issue_commented'
  | 'board_created'
  | 'board_updated'
  | 'task_created'
  | 'task_assigned'
  | 'task_moved'
  | 'task_completed'
  | 'task_deadline';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  user_id: string;
  user_name: string;
  user_initials: string;
  user_avatar?: string | null;
  action: string; // Human-readable action text
  target: string; // What was acted upon
  target_id?: string | null; // ID of issue/task/board
  issue_number?: number | null;
  created_at: string;
  link?: string | null;
}

/**
 * Get recent activity across all entities
 * @param daysBack - Number of days to look back (default 30)
 * @param limit - Maximum number of activities to return (default 50)
 * @param offset - Offset for pagination (default 0)
 */
export async function getRecentActivity(
  options: {
    daysBack?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ activities: RecentActivity[]; hasMore: boolean }> {
  const supabase = createClient();
  const { daysBack = 30, limit = 50, offset = 0 } = options;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Fetch issue activities
  const { data: issueActivities, error: issueError } = await supabase
    .from('issue_activities')
    .select(`
      id,
      activity_type,
      created_at,
      issue_id,
      user_id,
      content,
      issues!inner (
        id,
        issue_number,
        title,
        is_archived
      )
    `)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false });

  if (issueError) {
    logger.error('Error fetching issue activities:', issueError);
  }

  // Fetch task activities
  const { data: taskActivities, error: taskError } = await supabase
    .from('task_activity')
    .select(`
      id,
      action,
      created_at,
      task_id,
      user_id,
      details,
      tasks!inner (
        id,
        title,
        board_id
      )
    `)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false });

  if (taskError) {
    logger.error('Error fetching task activities:', taskError);
  }

  // Fetch board creations (from boards table)
  const { data: boardActivities, error: boardError } = await supabase
    .from('boards')
    .select(`
      id,
      title,
      created_at,
      created_by
    `)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false });

  if (boardError) {
    logger.error('Error fetching board activities:', boardError);
  }

  // Collect all user IDs
  const allUserIds = new Set<string>();
  issueActivities?.forEach((a: any) => allUserIds.add(a.user_id));
  taskActivities?.forEach((a: any) => allUserIds.add(a.user_id));
  boardActivities?.forEach((b: any) => allUserIds.add(b.created_by));

  // Fetch all profiles in one query
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, initials, avatar_url')
    .in('id', Array.from(allUserIds));

  // Create profile lookup map
  const profileMap = new Map();
  profiles?.forEach((p: any) => {
    profileMap.set(p.id, p);
  });

  // Transform and combine all activities
  const activities: RecentActivity[] = [];

  // Process issue activities
  if (issueActivities) {
    issueActivities.forEach((activity: any) => {
      // Skip archived issues
      if (activity.issues?.is_archived) return;

      const activityType = mapIssueActivityType(activity.activity_type);
      if (!activityType) return;

      const profile = profileMap.get(activity.user_id);

      activities.push({
        id: `issue-${activity.id}`,
        type: activityType,
        user_id: activity.user_id,
        user_name: profile?.username || 'Unknown',
        user_initials: profile?.initials || '??',
        user_avatar: profile?.avatar_url,
        action: getIssueActionText(activity.activity_type),
        target: activity.issues?.title || 'Unknown issue',
        target_id: activity.issue_id,
        issue_number: activity.issues?.issue_number,
        created_at: activity.created_at,
        link: `/issues/${activity.issues?.issue_number}`,
      });
    });
  }

  // Process task activities
  if (taskActivities) {
    taskActivities.forEach((activity: any) => {
      const activityType = mapTaskActivityType(activity.action);
      if (!activityType) return;

      const profile = profileMap.get(activity.user_id);

      activities.push({
        id: `task-${activity.id}`,
        type: activityType,
        user_id: activity.user_id,
        user_name: profile?.username || 'Unknown',
        user_initials: profile?.initials || '??',
        user_avatar: profile?.avatar_url,
        action: getTaskActionText(activity.action),
        target: activity.tasks?.title || 'Unknown task',
        target_id: activity.task_id,
        created_at: activity.created_at,
        link: activity.tasks?.board_id 
          ? `/boards/${activity.tasks.board_id}?task=${activity.task_id}`
          : null,
      });
    });
  }

  // Process board creations
  if (boardActivities) {
    boardActivities.forEach((board: any) => {
      const profile = profileMap.get(board.created_by);

      activities.push({
        id: `board-${board.id}`,
        type: 'board_created',
        user_id: board.created_by,
        user_name: profile?.username || 'Unknown',
        user_initials: profile?.initials || '??',
        user_avatar: profile?.avatar_url,
        action: 'created board',
        target: board.title,
        target_id: board.id,
        created_at: board.created_at,
        link: `/boards/${board.id}`,
      });
    });
  }

  // Sort all activities by created_at (most recent first)
  activities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply pagination
  const paginatedActivities = activities.slice(offset, offset + limit);
  const hasMore = activities.length > offset + limit;

  return {
    activities: paginatedActivities,
    hasMore,
  };
}

/**
 * Map issue activity type to our activity type enum
 */
function mapIssueActivityType(
  activityType: Database['public']['Enums']['activity_type']
): ActivityType | null {
  const mapping: Record<string, ActivityType> = {
    'status_change': 'issue_updated',
    'assignee_add': 'issue_updated',
    'assignee_remove': 'issue_updated',
    'reopened': 'issue_reopened',
    'closed': 'issue_closed',
    'field_update': 'issue_updated',
    'comment': 'issue_commented',
  };

  // For new issues, we need to check if it's a status_change from nothing
  // For now, we'll filter these in the query or handle separately
  return mapping[activityType] || null;
}

/**
 * Map task action to our activity type enum
 */
function mapTaskActivityType(
  action: Database['public']['Enums']['task_action']
): ActivityType | null {
  const mapping: Record<string, ActivityType> = {
    'created': 'task_created',
    'moved': 'task_moved',
    'updated': 'task_assigned', // Generic update, might be assignment
    'completed': 'task_completed',
    'assigned': 'task_assigned',
  };

  return mapping[action] || null;
}

/**
 * Get human-readable action text for issue activities
 */
function getIssueActionText(
  activityType: Database['public']['Enums']['activity_type']
): string {
  const mapping: Record<string, string> = {
    'status_change': 'updated',
    'assignee_add': 'assigned',
    'assignee_remove': 'unassigned',
    'reopened': 'reopened issue',
    'closed': 'closed issue',
    'field_update': 'updated',
    'comment': 'commented on',
    'archived': 'archived',
  };

  return mapping[activityType] || 'updated';
}

/**
 * Get human-readable action text for task activities
 */
function getTaskActionText(
  action: Database['public']['Enums']['task_action']
): string {
  const mapping: Record<string, string> = {
    'created': 'created task',
    'moved': 'moved task',
    'updated': 'updated task',
    'completed': 'completed task',
    'commented': 'commented on task',
    'assigned': 'assigned task',
  };

  return mapping[action] || 'updated task';
}

/**
 * Get activity for a specific issue
 */
export async function getIssueActivity(
  issueId: string,
  limit: number = 20
): Promise<RecentActivity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('issue_activities')
    .select(`
      id,
      activity_type,
      created_at,
      issue_id,
      user_id,
      content,
      issues!inner (
        id,
        issue_number,
        title
      ),
      profiles!inner (
        username,
        initials,
        avatar_url
      )
    `)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Error fetching issue activity:', error);
    return [];
  }

  return (data || []).map((activity: any) => ({
    id: `issue-${activity.id}`,
    type: mapIssueActivityType(activity.activity_type) || 'issue_updated',
    user_id: activity.user_id,
    user_name: activity.profiles?.username || 'Unknown',
    user_initials: activity.profiles?.initials || '??',
    user_avatar: activity.profiles?.avatar_url,
    action: getIssueActionText(activity.activity_type),
    target: activity.issues?.title || 'Unknown issue',
    target_id: activity.issue_id,
    issue_number: activity.issues?.issue_number,
    created_at: activity.created_at,
    link: `/issues/${activity.issues?.issue_number}`,
  }));
}

/**
 * Get activity for a specific task
 */
export async function getTaskActivity(
  taskId: string,
  limit: number = 20
): Promise<RecentActivity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('task_activity')
    .select(`
      id,
      action,
      created_at,
      task_id,
      user_id,
      details,
      tasks!inner (
        id,
        title,
        board_id
      ),
      profiles!inner (
        username,
        initials,
        avatar_url
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Error fetching task activity:', error);
    return [];
  }

  return (data || []).map((activity: any) => ({
    id: `task-${activity.id}`,
    type: mapTaskActivityType(activity.action) || 'task_assigned',
    user_id: activity.user_id,
    user_name: activity.profiles?.username || 'Unknown',
    user_initials: activity.profiles?.initials || '??',
    user_avatar: activity.profiles?.avatar_url,
    action: getTaskActionText(activity.action),
    target: activity.tasks?.title || 'Unknown task',
    target_id: activity.task_id,
    created_at: activity.created_at,
    link: activity.tasks?.board_id 
      ? `/boards/${activity.tasks.board_id}?task=${activity.task_id}`
      : null,
  }));
}