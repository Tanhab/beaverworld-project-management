import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getColumnTasks,
  getTask,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  getNextTaskPosition,
  reorderTasks,
  getFilteredTasks,
  createComment,
  updateComment,
  deleteComment,
  getTaskActivity,
} from '@/lib/api/tasks';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CreateCommentInput,
  UpdateCommentInput,
  TaskFilters,
} from '@/lib/types/database';
import { toast } from 'sonner';

// ============================================
// TASKS
// ============================================

export function useColumnTasks(columnId: string) {
  return useQuery({
    queryKey: ['tasks', 'column', columnId],
    queryFn: () => getColumnTasks(columnId),
    enabled: !!columnId,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
  });
}

export function useFilteredTasks(boardId: string, filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', 'board', boardId, 'filtered', filters],
    queryFn: () => getFilteredTasks(boardId, filters),
    enabled: !!boardId,
  });
}

export function useCreateTask(userId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask(userId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(taskId, input, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      toast.success('Task updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
}

export function useMoveTask(userId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      columnId,
      position,
    }: {
      taskId: string;
      columnId: string;
      position: number;
    }) => moveTask(taskId, columnId, position, userId),
    onMutate: async ({ taskId, columnId, position }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'details'] });
      
      const previousBoard = queryClient.getQueryData(['boards', boardId, 'details']);
      
      queryClient.setQueryData(['boards', boardId, 'details'], (old: any) => {
        if (!old?.columns) return old;
        
        // Find the task and remove it from its current column
        let movedTask: any = null;
        const updatedColumns = old.columns.map((col: any) => {
          const taskIndex = col.tasks?.findIndex((t: any) => t.id === taskId);
          if (taskIndex !== -1) {
            movedTask = { ...col.tasks[taskIndex], column_id: columnId, position };
            return {
              ...col,
              tasks: col.tasks.filter((t: any) => t.id !== taskId),
            };
          }
          return col;
        });
        
        // Add the task to its new column
        if (movedTask) {
          const targetColumn = updatedColumns.find((col: any) => col.id === columnId);
          if (targetColumn) {
            targetColumn.tasks = [...(targetColumn.tasks || []), movedTask];
            targetColumn.tasks.sort((a: any, b: any) => a.position - b.position);
          }
        }
        
        return { ...old, columns: updatedColumns };
      });
      
      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['boards', boardId, 'details'], context.previousBoard);
      }
      toast.error('Failed to move task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
    },
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
}

export function useReorderTasks(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; column_id: string; position: number }>) =>
      reorderTasks(updates),
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'details'] });
      
      const previousBoard = queryClient.getQueryData(['boards', boardId, 'details']);
      
      queryClient.setQueryData(['boards', boardId, 'details'], (old: any) => {
        if (!old?.columns) return old;
        
        const updatedColumns = old.columns.map((col: any) => {
          const updatedTasks = col.tasks?.map((task: any) => {
            const update = updates.find((u) => u.id === task.id);
            return update ? { ...task, column_id: update.column_id, position: update.position } : task;
          });
          
          return {
            ...col,
            tasks: updatedTasks?.sort((a: any, b: any) => a.position - b.position) || [],
          };
        });
        
        return { ...old, columns: updatedColumns };
      });
      
      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['boards', boardId, 'details'], context.previousBoard);
      }
      toast.error('Failed to reorder tasks');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
    },
  });
}

export function useNextTaskPosition(columnId: string) {
  return useQuery({
    queryKey: ['tasks', 'column', columnId, 'next-position'],
    queryFn: () => getNextTaskPosition(columnId),
    enabled: !!columnId,
  });
}

// ============================================
// COMMENTS
// ============================================

export function useCreateComment(userId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateCommentInput }) =>
      updateComment(commentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Comment updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}

// ============================================
// ACTIVITY
// ============================================

export function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'activity'],
    queryFn: () => getTaskActivity(taskId),
    enabled: !!taskId,
  });
}