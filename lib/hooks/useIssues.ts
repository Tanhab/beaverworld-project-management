// lib/hooks/useIssues.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllIssues,
  getIssueById,
  getIssueByNumber,
  createIssue,
  updateIssue,
  archiveIssue,
  closeIssue,
  reopenIssue,
  addAssignees,
  removeAssignees,
  addIssueActivity,
  getMyIssues,
} from '../api/issues';
import { CreateIssueInput, UpdateIssueInput, IssueStatus,
  IssuePriority,
  IssueCategory, } from '@/lib/types/database';
import { toast } from 'sonner';

// Types for filters
export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  category?: IssueCategory[];
  assignedTo?: string[];
  createdBy?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isArchived?: boolean;
}

/**
 * Hook to fetch all issues with optional filters
 */
export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => getAllIssues(filters),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch a single issue by ID
 */
export function useIssue(issueId: string | undefined) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => {
      if (!issueId) throw new Error('Issue ID is required');
      return getIssueById(issueId);
    },
    enabled: !!issueId,
  });
}

/**
 * Hook to fetch issue by issue number
 */
export function useIssueByNumber(issueNumber: number | undefined) {
  return useQuery({
    queryKey: ['issues', 'number', issueNumber],
    queryFn: () => {
      if (!issueNumber) throw new Error('Issue number is required');
      return getIssueByNumber(issueNumber);
    },
    enabled: !!issueNumber && issueNumber > 0,
  });
}

/**
 * Hook to fetch issues assigned to current user
 */
export function useMyIssues() {
  return useQuery({
    queryKey: ['issues', 'my-issues'],
    queryFn: getMyIssues,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new issue
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issue,
      assigneeIds,
    }: {
      issue: Omit<CreateIssueInput, 'created_by' | 'issue_number'>;
      assigneeIds: string[];
    }) => createIssue(issue, assigneeIds),
    onSuccess: (data) => {
      // Invalidate all issues queries to refetch
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      
      toast.success('Issue created successfully', {
        description: `Issue #${data.issue_number} - ${data.title}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create issue', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an issue
 */
export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      updates,
    }: {
      issueId: string;
      updates: UpdateIssueInput;
    }) => updateIssue(issueId, updates),
    onSuccess: (data) => {
      // Invalidate issues list
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      // Update specific issue cache
      queryClient.setQueryData(['issues', data.id], data);
      queryClient.setQueryData(['issues', 'number', data.issue_number], data);
      
      toast.success('Issue updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update issue', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to archive an issue
 */
export function useArchiveIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => archiveIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue archived successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to archive issue', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to close an issue
 */
export function useCloseIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      solvedCommitNumber,
    }: {
      issueId: string;
      solvedCommitNumber?: string;
    }) => closeIssue(issueId, solvedCommitNumber),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.setQueryData(['issues', data.id], data);
      queryClient.setQueryData(['issues', 'number', data.issue_number], data);
      
      toast.success('Issue closed successfully', {
        description: `Issue #${data.issue_number} has been marked as closed`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to close issue', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to reopen a closed issue
 */
export function useReopenIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => reopenIssue(issueId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.setQueryData(['issues', data.id], data);
      queryClient.setQueryData(['issues', 'number', data.issue_number], data);
      
      toast.success('Issue reopened successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to reopen issue', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to add assignees to an issue
 */
export function useAddAssignees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      userIds,
    }: {
      issueId: string;
      userIds: string[];
    }) => addAssignees(issueId, userIds),
    onSuccess: (_, variables) => {
      // Invalidate the specific issue and list
      queryClient.invalidateQueries({ queryKey: ['issues', variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      
      toast.success('Assignees added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add assignees', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to remove assignees from an issue
 */
export function useRemoveAssignees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      userIds,
    }: {
      issueId: string;
      userIds: string[];
    }) => removeAssignees(issueId, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues', variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      
      toast.success('Assignees removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove assignees', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to add activity/comment to an issue
 */
export function useAddIssueActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      activityType,
      content,
    }: {
      issueId: string;
      activityType: string;
      content: any;
    }) => addIssueActivity(issueId, activityType, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues', variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      
      if (variables.activityType === 'comment') {
        toast.success('Comment added successfully');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to add activity', {
        description: error.message,
      });
    },
  });
}