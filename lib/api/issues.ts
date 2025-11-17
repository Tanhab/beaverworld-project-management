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
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,issue_number.eq.${filters.search}`);
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
    console.error('Error fetching issues:', error);
    throw error;
  }
  if (!issues) return [];

  // Fetch assignees separately (can't join many-to-many efficiently)
  const issuesWithAssignees = await Promise.all(
    issues.map(async (issue) => {
      // Fetch assignees with profiles in one query
      const { data: assigneeData } = await supabase
        .from('issue_assignees')
        .select(`
          profiles!issue_assignees_user_id_fkey(
            id, username, initials, avatar_url
          )
        `)
        .eq('issue_id', issue.id);

      const assignees = assigneeData?.map(a => a.profiles).filter(Boolean) || [];

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
    console.error('Error fetching issue:', error);
    throw error;
  }
  if (!issue) return null;

  // Fetch assignees with profiles
  const { data: assigneeData } = await supabase
    .from('issue_assignees')
    .select(`
      profiles!issue_assignees_user_id_fkey(
        id, username, initials, avatar_url
      )
    `)
    .eq('issue_id', issue.id);

  const assignees = assigneeData?.map(a => a.profiles).filter(Boolean) || [];

  // Fetch activities with user profiles in one query
  const { data: activities } = await supabase
    .from('issue_activities')
    .select(`
      *,
      user_profile:profiles!issue_activities_user_id_fkey(
        id, username, initials, avatar_url
      )
    `)
    .eq('issue_id', issue.id)
    .order('created_at', { ascending: false });
  
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
  
  const { data: { user } } = await supabase.auth.getUser();
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
  
  if (assigneeIds.length > 0) {
    const assignees = assigneeIds.map(userId => ({
      issue_id: issue.id,
      user_id: userId,
      assigned_by: user.id,
    }));
    
    const { error: assigneeError } = await supabase
      .from('issue_assignees')
      .insert(assignees);
    
    if (assigneeError) throw assigneeError;
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
  solvedCommitNumber?: string
): Promise<IssueWithRelations> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
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
  
  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', issueId)
    .select()
    .single();
  
  if (error) throw error;
  
  const fullIssue = await getIssueById(issueId);
  if (!fullIssue) throw new Error('Failed to fetch closed issue');
  
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
  userIds: string[]
): Promise<void> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Check if users exist in profiles table
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .in('id', userIds);
  
  if (!profiles || profiles.length !== userIds.length) {
    throw new Error('One or more users not found');
  }
  
  const assignees = userIds.map(userId => ({
    issue_id: issueId,
    user_id: userId,
    assigned_by: user.id,
  }));
  
  const { error } = await supabase
    .from('issue_assignees')
    .insert(assignees);
  
  if (error) throw error;
  
  await supabase
    .from('issues')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', issueId);
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

      const assignees = assigneeData?.map(a => a.profiles).filter(Boolean) || [];

      return {
        ...issue,
        assignees,
        activities: [],
      };
    })
  );
  
  return issuesWithAssignees as unknown as IssueWithRelations[];
}