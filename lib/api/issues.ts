// lib/api/issues.ts
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

/**
 * Get all issues with optional filtering
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
      *
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
  
  if (error) throw error;
  if (!issues) return [];

  // Fetch related data separately
  const issuesWithRelations = await Promise.all(
    issues.map(async (issue) => {
      // Fetch creator profile
      const { data: createdByProfile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', issue.created_by)
        .single();

      // Fetch assignees
      const { data: assigneeData } = await supabase
        .from('issue_assignees')
        .select('user_id')
        .eq('issue_id', issue.id);

      let assignees: Array<{ id: string; username: string; avatar_url: string | null }> = [];
      if (assigneeData && assigneeData.length > 0) {
        const userIds = assigneeData.map(a => a.user_id);
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        assignees = users || [];
      }

      // Fetch images
      const { data: images } = await supabase
        .from('issue_images')
        .select('id, storage_path, display_order')
        .eq('issue_id', issue.id)
        .order('display_order');

      return {
        ...issue,
        created_by_profile: createdByProfile || undefined,
        assignees: assignees || [],
        images: images || [],
        activities: [],
      };
    })
  );
  
  return issuesWithRelations as unknown as IssueWithRelations[];
}

/**
 * Get a single issue by ID with all relations
 */
export async function getIssueById(issueId: string): Promise<IssueWithRelations | null> {
  const supabase = createClient();
  
  // Fetch the issue
  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', issueId)
    .single();
  
  if (error) throw error;
  if (!issue) return null;

  // Fetch creator profile
  const { data: createdByProfile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', issue.created_by)
    .single();

  // Fetch closed by profile if exists
  let closedByProfile = undefined;
  if (issue.closed_by) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', issue.closed_by)
      .single();
    closedByProfile = data || undefined;
  }

  // Fetch assignees
  const { data: assigneeData } = await supabase
    .from('issue_assignees')
    .select('user_id, assigned_at, assigned_by')
    .eq('issue_id', issue.id);

  let assignees: Array<{ id: string; username: string; avatar_url: string | null }> = [];
  if (assigneeData && assigneeData.length > 0) {
    const userIds = assigneeData.map(a => a.user_id);
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    assignees = users || [];
  }

  // Fetch images
  const { data: images } = await supabase
    .from('issue_images')
    .select('*')
    .eq('issue_id', issue.id)
    .order('display_order');

  // Fetch activities
  const { data: activities } = await supabase
    .from('issue_activities')
    .select('*')
    .eq('issue_id', issue.id)
    .order('created_at', { ascending: false });
  
  return {
    ...issue,
    created_by_profile: createdByProfile || undefined,
    closed_by_profile: closedByProfile,
    assignees: assignees || [],
    images: images || [],
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
 */
export async function getMyIssues(): Promise<IssueWithRelations[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data: assignments, error: assignError } = await supabase
    .from('issue_assignees')
    .select('issue_id')
    .eq('user_id', user.id);
  
  if (assignError) throw assignError;
  
  const issueIds = assignments.map(a => a.issue_id);
  
  if (issueIds.length === 0) return [];
  
  const { data: issues, error } = await supabase
    .from('issues')
    .select('*')
    .in('id', issueIds)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  if (!issues) return [];

  // Fetch related data for each issue
  const issuesWithRelations = await Promise.all(
    issues.map(async (issue) => {
      const { data: createdByProfile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', issue.created_by)
        .single();

      const { data: assigneeData } = await supabase
        .from('issue_assignees')
        .select('user_id')
        .eq('issue_id', issue.id);

      let assignees: Array<{ id: string; username: string; avatar_url: string | null }> = [];
      if (assigneeData && assigneeData.length > 0) {
        const userIds = assigneeData.map(a => a.user_id);
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        assignees = users || [];
      }

      const { data: images } = await supabase
        .from('issue_images')
        .select('id, storage_path, display_order')
        .eq('issue_id', issue.id)
        .order('display_order');

      return {
        ...issue,
        created_by_profile: createdByProfile || undefined,
        assignees: assignees || [],
        images: images || [],
        activities: [],
      };
    })
  );
  
  return issuesWithRelations as unknown as IssueWithRelations[];
}