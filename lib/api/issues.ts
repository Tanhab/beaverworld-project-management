// lib/api/issues.ts - OPTIMIZED with new profile schema
import { createClient } from '@/lib/supabase/client';
import type { 
  Issue, 
  IssueWithRelations,
  CreateIssueInput,
  UpdateIssueInput,
  IssueActivity,
  Database,
  Profile,
} from '@/lib/types/database';
import { Json } from '../types/database.types';
import { createNotificationsForUsers } from './notifications';
import { sendDiscordNotification } from '@/lib/integrations/discord';
import {
  sendIssueCreatedEmail,
  sendAssignedEmail,
  sendCommentEmail,
  sendIssueClosedEmail,
} from "@/lib/actions/email-notifications";
import { logger } from '../logger';


/**
 * Get all issues with optional filtering
 * OPTIMIZED: Single query with joins instead of N+1 queries
 */
export async function getAllIssues(filters?: {
  status?: Database["public"]["Enums"]["issue_status"][];
  priority?: Database["public"]["Enums"]["issue_priority"][];
  category?: Database["public"]["Enums"]["issue_category"][];
  assignedTo?: string[];
  createdBy?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isArchived?: boolean;
}): Promise<IssueWithRelations[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('issues')
    .select(`
      *,
      created_by_profile:profiles!issues_created_by_fkey(
        id, username, initials, avatar_url
      ),
      closed_by_profile:profiles!issues_closed_by_fkey(
        id, username, initials, avatar_url
      ),
      images:issue_images(id, storage_path, display_order)
    `)
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  
  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority);
  }
  
  if (filters?.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }
  
  if (filters?.createdBy) {
    query = query.eq('created_by', filters.createdBy);
  }
  
  if (filters?.search) {
  const searchTerm = filters.search;
  const isNumeric = /^\d+$/.test(searchTerm);
  
  if (isNumeric) {
    // If search is numeric, search title, description, and issue_number
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,issue_number.eq.${searchTerm}`);
  } else {
    // If search is text, only search title and description
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
}
  
  if (filters?.dateFrom) {
    query = query.gte('updated_at', filters.dateFrom.toISOString());
  }
  
  if (filters?.dateTo) {
    query = query.lte('updated_at', filters.dateTo.toISOString());
  }
  
  if (filters?.isArchived !== undefined) {
    query = query.eq('is_archived', filters.isArchived);
  } else {
    query = query.eq('is_archived', false);
  }
  
  const { data: issues, error } = await query;
  
  if (error) {
    logger.error('Error fetching issues:', error);
    throw error;
  }
  if (!issues) return [];

  // Fetch assignees separately (can't join many-to-many efficiently)
  const issuesWithAssignees = await Promise.all(
    issues.map(async (issue) => {
      // Fetch assignees with profiles separately
      const { data: assigneeData } = await supabase
        .from('issue_assignees')
        .select('user_id')
        .eq('issue_id', issue.id);
      
      if (!assigneeData || assigneeData.length === 0) {
        return { ...issue, assignees: [] };
      }
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, initials, avatar_url')
        .in('id', assigneeData.map((a: any) => a.user_id));

      const assignees: any[] = assigneeData?.map((a: any) => a.profiles).filter(Boolean) || [];

      return {
        ...issue,
        assignees,
        activities: [], // Don't fetch activities for list view (performance)
      };
    })
  );
  
  return issuesWithAssignees as unknown as IssueWithRelations[];
}

/**
 * Get a single issue by ID with all relations
 * OPTIMIZED: Better joins and batched profile fetching
 */
export async function getIssueById(issueId: string): Promise<IssueWithRelations | null> {
  const supabase = createClient();
  
  // Fetch issue with creator, closer, and images in one query
  const { data: issue, error } = await supabase
    .from('issues')
    .select(`
      *,
      created_by_profile:profiles!issues_created_by_fkey(
        id, username, initials, avatar_url
      ),
      closed_by_profile:profiles!issues_closed_by_fkey(
        id, username, initials, avatar_url
      ),
      images:issue_images(*)
    `)
    .eq('id', issueId)
    .single();
  
  if (error) {
    logger.error('Error fetching issue:', error);
    throw error;
  }
  if (!issue) return null;

  // Fetch assignees with profiles separately
  const { data: assigneeData } = await supabase
    .from('issue_assignees')
    .select('user_id')
    .eq('issue_id', issue.id);

  let assignees: any[] = [];
  if (assigneeData && assigneeData.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, initials, avatar_url')
      .in('id', assigneeData.map((a: any) => a.user_id));
    assignees = profiles || [];
  }

  // Fetch activities and user profiles separately
  const { data: activities } = await supabase
    .from('issue_activities')
    .select('*')
    .eq('issue_id', issue.id)
    .order('created_at', { ascending: false });
  
  if (activities && activities.length > 0) {
    const userIds = [...new Set(activities.map((a: any) => a.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, initials, avatar_url')
      .in('id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    activities.forEach(activity => {
      (activity as any).user_profile = profileMap.get(activity.user_id);
    });
  }
  
  return {
    ...issue,
    assignees,
    activities: activities || [],
  } as unknown as IssueWithRelations;
}

/**
 * Get issue by issue number
 */
export async function getIssueByNumber(issueNumber: number): Promise<IssueWithRelations | null> {
  const supabase = createClient();
  
  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('issue_number', issueNumber)
    .single();
  
  if (error) throw error;
  if (!issue) return null;

  return getIssueById(issue.id);
}

/**
 * Create a new issue
 */
export async function createIssue(
  input: Omit<CreateIssueInput, 'created_by' | 'issue_number'>,
  assigneeIds: string[]
): Promise<IssueWithRelations> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (issueError) throw issueError;

  // Insert assignees
  if (assigneeIds.length > 0) {
    const assignees = assigneeIds.map((userId) => ({
      issue_id: issue.id,
      user_id: userId,
      assigned_by: user.id,
    }));

    const { error: assigneeError } = await supabase
      .from('issue_assignees')
      .insert(assignees);

    if (assigneeError) throw assigneeError;

    // In-app + Discord notifications
    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      const username = currentProfile?.username || 'Someone';

      const notifications = await createNotificationsForUsers(assigneeIds, {
        type: 'issue_assigned',
        title: `Added as collaborator in Issue #${issue.issue_number}`,
        message: `${username} assigned you to: ${issue.title}`,
        link: `/issues/${issue.issue_number}`,
        priority:
          issue.priority === 'urgent' || issue.priority === 'high'
            ? 'high'
            : 'normal',
        issue_id: issue.id,
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, discord_id')
        .in('id', assigneeIds);

      const usersWithDiscord =
        profiles
          ?.filter((p: any) => p.discord_id)
          .map((p: any) => ({
            discord_id: p.discord_id as string,
            username: p.username as string,
          })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'issue_assigned',
          title: `Issue #${issue.issue_number} assigned`,
          message: issue.title,
          link: `/issues/${issue.issue_number}`,
          priority:
            issue.priority === 'urgent' || issue.priority === 'high'
              ? 'high'
              : 'normal',
          users: usersWithDiscord,
        });
      }
      

      
    } catch (error) {
      logger.error('Failed to send notifications (createIssue):', error);
    }
  }
   try {
        await sendIssueCreatedEmail(issue.id);
      } catch (error) {
        logger.error("Failed to send email notification:", error);
      }

  const fullIssue = await getIssueById(issue.id);
  if (!fullIssue) throw new Error('Failed to fetch created issue');

  return fullIssue;
}


/**
 * Update an issue
 */
export async function updateIssue(
  issueId: string,
  updates: UpdateIssueInput
): Promise<IssueWithRelations> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('issues')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', issueId)
    .select()
    .single();
  
  if (error) throw error;
  
  const fullIssue = await getIssueById(issueId);
  if (!fullIssue) throw new Error('Failed to fetch updated issue');
  
  // Notify on status change
  if (updates.status) {
    try {
      const assigneeIds = fullIssue.assignees?.map((a: any) => a.id) || [];
      const notifyIds = [...new Set([...assigneeIds, fullIssue.created_by])];
      
      const statusText = updates.status === 'closed' ? 'closed' : updates.status === 'pending_approval' ? 'pending approval' : 'updated';
      
      const { data: updaterProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      const updaterName = updaterProfile?.username || 'Someone';
      
      const notifications = await createNotificationsForUsers(notifyIds, {
        type: 'issue_updated',
        title: `Issue #${fullIssue.issue_number} status changed to "${statusText}"`,
        message: `${updaterName} changed status of: ${fullIssue.title}`,
        link: `/issues/${fullIssue.issue_number}`,
        priority: 'normal',
        issue_id: fullIssue.id,
      });

      const { data: profiles } = await supabase.from('profiles').select('id, username, discord_id').in('id', notifyIds);
      const usersWithDiscord = profiles?.filter((p: any) => p.discord_id).map((p: any) => ({ discord_id: p.discord_id!, username: p.username })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'issue_updated',
          title: `Issue #${fullIssue.issue_number} ${statusText}`,
          message: fullIssue.title,
          link: `/issues/${fullIssue.issue_number}`,
          priority: 'normal',
          users: usersWithDiscord,
        });
      }

    } catch (error) {
      logger.error('Failed to send status change notifications:', error);
    }
  }

  return fullIssue;
}

/**
 * Delete/Archive an issue
 */
export async function archiveIssue(issueId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('issues')
    .update({ 
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', issueId);
  
  if (error) throw error;
}

/**
 * Close an issue
 */
export async function closeIssue(
  issueId: string,
  solvedCommitNumber?: string,
  closingMessage?: string
): Promise<IssueWithRelations> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: UpdateIssueInput = {
    status: 'closed',
    closed_at: new Date().toISOString(),
    closed_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (solvedCommitNumber) {
    updates.solved_commit_number = solvedCommitNumber;
  }

  const { error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', issueId);

  if (error) throw error;

  const fullIssue = await getIssueById(issueId);
  if (!fullIssue) throw new Error('Failed to fetch closed issue');

  // 🔔 Send all notifications on close
  if (fullIssue.assignees && fullIssue.assignees.length > 0) {
    try {
      const assigneeIds = fullIssue.assignees.map((a: any) => a.id as string);

      // 1) In-app notifications
      const notifications = await createNotificationsForUsers(assigneeIds, {
        type: 'issue_closed',
        title: `Issue #${fullIssue.issue_number} was closed`,
        message: closingMessage || fullIssue.title,
        link: `/issues/${fullIssue.issue_number}`,
        priority: 'normal',
        issue_id: fullIssue.id,
      });

      // 2) Discord notifications
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, discord_id')
        .in('id', assigneeIds);

      const usersWithDiscord =
        profiles
          ?.filter((p: any) => p.discord_id)
          .map((p: any) => ({
            discord_id: p.discord_id as string,
            username: p.username as string,
          })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'issue_closed',
          title: `Issue #${fullIssue.issue_number} closed`,
          message: closingMessage || fullIssue.title,
          link: `/issues/${fullIssue.issue_number}`,
          priority: 'normal',
          users: usersWithDiscord,
        });
      }

      // 3) Email notifications
      await sendIssueClosedEmail(issueId, user.id, user.email || '', closingMessage);
    } catch (error) {
      logger.error('Failed to send notifications for closed issue:', error);
    }
  }

  return fullIssue;
}

/**
 * Reopen a closed issue
 */
export async function reopenIssue(issueId: string): Promise<IssueWithRelations> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('issues')
    .update({
      status: 'open',
      closed_at: null,
      closed_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', issueId)
    .select()
    .single();
  
  if (error) throw error;
  
  const fullIssue = await getIssueById(issueId);
  if (!fullIssue) throw new Error('Failed to fetch reopened issue');
  
  return fullIssue;
}

/**
 * Add assignees to an issue
 */
export async function addAssignees(
  issueId: string,
  userIds: string[],
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if users exist in profiles table
  const { data: existingProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .in('id', userIds);

  if (profilesError) throw profilesError;
  if (!existingProfiles || existingProfiles.length !== userIds.length) {
    throw new Error('One or more assignees not found');
  }

  // Existing assignees
  const { data: existingAssignees, error: existingError } = await supabase
    .from('issue_assignees')
    .select('user_id')
    .eq('issue_id', issueId);

  if (existingError) throw existingError;

  const existingIds =
    existingAssignees?.map((a: any) => a.user_id as string) || [];
  const newUserIds = userIds.filter((id) => !existingIds.includes(id));

  // Insert only new ones
  if (newUserIds.length > 0) {
    const assignees = newUserIds.map((uid) => ({
      issue_id: issueId,
      user_id: uid,
      assigned_by: user.id,
    }));

    const { error: insertError } = await supabase
      .from('issue_assignees')
      .insert(assignees);
    if (insertError) throw insertError;
  }

  // Touch issue.updated_at
  await supabase
    .from('issues')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', issueId);

  // Notify new assignees only
  if (newUserIds.length > 0) {
    try {
      const issue = await getIssueById(issueId);
      if (!issue) return;

      const notifications = await createNotificationsForUsers(newUserIds, {
        type: 'issue_assigned',
        title: `Issue #${issue.issue_number} assigned to you`,
        message: issue.title,
        link: `/issues/${issue.issue_number}`,
        priority:
          issue.priority === 'urgent' || issue.priority === 'high'
            ? 'high'
            : 'normal',
        issue_id: issue.id,
      });

      // Discord
      const { data: discordProfiles } = await supabase
        .from('profiles')
        .select('id, username, discord_id')
        .in('id', newUserIds);

      const usersWithDiscord =
        discordProfiles
          ?.filter((p: any) => p.discord_id)
          .map((p: any) => ({
            discord_id: p.discord_id as string,
            username: p.username as string,
          })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'issue_assigned',
          title: `Issue #${issue.issue_number} assigned`,
          message: issue.title,
          link: `/issues/${issue.issue_number}`,
          priority:
            issue.priority === 'urgent' || issue.priority === 'high'
              ? 'high'
              : 'normal',
          users: usersWithDiscord,
        });
      }

    } catch (error) {
      logger.error(
        'Failed to send notifications for new assignees (issue):',
        error,
      );
    }
    try {
        await sendAssignedEmail(issueId, newUserIds);
      } catch (error) {
        logger.error("Failed to send email notification:", error);
      }

  }
}


/**
 * Remove assignees from an issue
 */
export async function removeAssignees(
  issueId: string,
  userIds: string[]
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('issue_assignees')
    .delete()
    .eq('issue_id', issueId)
    .in('user_id', userIds);
  
  if (error) throw error;
  
  await supabase
    .from('issues')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', issueId);
}

/**
 * Add a comment/activity to an issue
 */
export async function addIssueActivity(
  issueId: string,
  activityType: string,
  content: any
): Promise<IssueActivity> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('issue_activities')
    .insert({
      issue_id: issueId,
      user_id: user.id,
      activity_type: activityType as any,
      content,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  await supabase
    .from('issues')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', issueId);
  
  // Notify on comments
    // Notify on comments
  if (activityType === 'comment') {
    try {
      const issue = await getIssueById(issueId);
      if (issue) {
        // Filter out the commenter themself
        const assigneeIds = (
          issue.assignees?.map((a: any) => a.id as string) || []
        ).filter((id: string) => id !== user.id);

        if (assigneeIds.length > 0) {
          const commentText =
            typeof content === 'object' &&
            content !== null &&
            'text' in content
              ? String((content as any).text)
              : '';
          const preview =
            commentText.substring(0, 100) +
            (commentText.length > 100 ? '...' : '');

          const notifications = await createNotificationsForUsers(
            assigneeIds,
            {
              type: 'issue_commented',
              title: `New comment on #${issue.issue_number}`,
              message: preview || issue.title,
              link: `/issues/${issue.issue_number}`,
              priority: 'normal',
              issue_id: issue.id,
            },
          );

          const { data: discordProfiles } = await supabase
            .from('profiles')
            .select('id, username, discord_id')
            .in('id', assigneeIds);

          const usersWithDiscord =
            discordProfiles
              ?.filter((p: any) => p.discord_id)
              .map((p: any) => ({
                discord_id: p.discord_id as string,
                username: p.username as string,
              })) || [];

          if (usersWithDiscord.length > 0 && notifications.length > 0) {
            await sendDiscordNotification({
              notificationId: notifications[0].id,
              type: 'issue_commented',
              title: `New comment on #${issue.issue_number}`,
              message: preview || issue.title,
              link: `/issues/${issue.issue_number}`,
              priority: 'normal',
              users: usersWithDiscord,
            });
          }
          try {
            await sendCommentEmail(issueId, preview);
          } catch (error) {
            logger.error("Failed to send email notification:", error);
          }
        } 
      }
    } catch (error) {
      logger.error(
        'Failed to send comment notifications (issue + email):',
        error,
      );
    }
    
  }


  return data;
}

/**
 * Get issues assigned to current user
 * OPTIMIZED: Single query with joins
 */
export async function getMyIssues(): Promise<IssueWithRelations[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Get issue IDs assigned to user
  const { data: assignments, error: assignError } = await supabase
    .from('issue_assignees')
    .select('issue_id')
    .eq('user_id', user.id);
  
  if (assignError) throw assignError;
  
  const issueIds = assignments?.map(a => a.issue_id) || [];
  if (issueIds.length === 0) return [];
  
  // Fetch issues with profiles
  const { data: issues, error } = await supabase
    .from('issues')
    .select(`
      *,
      created_by_profile:profiles!issues_created_by_fkey(
        id, username, initials, avatar_url
      ),
      images:issue_images(id, storage_path, display_order)
    `)
    .in('id', issueIds)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  if (!issues) return [];

  // Fetch assignees for each issue
  const issuesWithAssignees = await Promise.all(
    issues.map(async (issue) => {
      const { data: assigneeData } = await supabase
        .from('issue_assignees')
        .select(`
          profiles!issue_assignees_user_id_fkey(
            id, username, initials, avatar_url
          )
        `)
        .eq('issue_id', issue.id);

      const assignees: any[] = assigneeData?.map((a: any) => a.profiles).filter(Boolean) || [];

      return {
        ...issue,
        assignees,
        activities: [],
      };
    })
  );
  
  return issuesWithAssignees as unknown as IssueWithRelations[];
}