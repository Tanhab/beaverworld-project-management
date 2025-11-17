import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBoards,
  getBoard,
  getBoardWithDetails,
  createBoard,
  createBoardWithColumns,
  updateBoard,
  deleteBoard,
  toggleBoardPin,
  getUserBoards,
  getPinnedBoards,
} from '@/lib/api/boards';
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  getNextColumnPosition,
  getColumnCount,
} from '@/lib/api/columns';
import type {
  CreateBoardInput,
  UpdateBoardInput,
  BoardFilters,
  BoardSort,
  CreateColumnInput,
  UpdateColumnInput,
} from '@/lib/types/database';
import { toast } from 'sonner';

// ============================================
// BOARDS
// ============================================

export function useBoards(filters?: BoardFilters, sort?: BoardSort) {
  return useQuery({
    queryKey: ['boards', filters, sort],
    queryFn: () => getBoards(filters, sort),
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId],
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });
}

export function useBoardWithDetails(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId, 'details'],
    queryFn: () => getBoardWithDetails(boardId),
    enabled: !!boardId,
  });
}

export function useUserBoards(userId: string) {
  return useQuery({
    queryKey: ['boards', 'user', userId],
    queryFn: () => getUserBoards(userId),
    enabled: !!userId,
  });
}

export function usePinnedBoards() {
  return useQuery({
    queryKey: ['boards', 'pinned'],
    queryFn: () => getPinnedBoards(),
  });
}

export function useCreateBoard(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => createBoard(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create board');
    },
  });
}

export function useCreateBoardWithColumns(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => createBoardWithColumns(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board created with default columns');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create board');
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, input }: { boardId: string; input: UpdateBoardInput }) =>
      updateBoard(boardId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['boards', variables.boardId] });
      toast.success('Board updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update board');
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete board');
    },
  });
}

export function useToggleBoardPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, isPinned }: { boardId: string; isPinned: boolean }) =>
      toggleBoardPin(boardId, isPinned),
    onMutate: async ({ boardId, isPinned }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['boards'] });
      
      const previousBoards = queryClient.getQueryData(['boards']);
      
      queryClient.setQueryData(['boards'], (old: any) => {
        if (!old) return old;
        return old.map((board: any) =>
          board.id === boardId ? { ...board, is_pinned: isPinned } : board
        );
      });
      
      return { previousBoards };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      toast.error('Failed to update board pin status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

// ============================================
// COLUMNS
// ============================================

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateColumnInput) => createColumn(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.board_id, 'details'] });
      toast.success('Column created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create column');
    },
  });
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, input }: { columnId: string; input: UpdateColumnInput }) =>
      updateColumn(columnId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
      toast.success('Column updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update column');
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
      toast.success('Column deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete column');
    },
  });
}

export function useReorderColumns(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; position: number }>) => 
      reorderColumns(boardId, updates),
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['boards', boardId, 'details'] });
      
      const previousBoard = queryClient.getQueryData(['boards', boardId, 'details']);
      
      queryClient.setQueryData(['boards', boardId, 'details'], (old: any) => {
        if (!old?.columns) return old;
        
        const updatedColumns = old.columns.map((col: any) => {
          const update = updates.find((u) => u.id === col.id);
          return update ? { ...col, position: update.position } : col;
        });
        
        updatedColumns.sort((a: any, b: any) => a.position - b.position);
        
        return { ...old, columns: updatedColumns };
      });
      
      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['boards', boardId, 'details'], context.previousBoard);
      }
      toast.error('Failed to reorder columns');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'details'] });
    },
  });
}

export function useNextColumnPosition(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId, 'next-column-position'],
    queryFn: () => getNextColumnPosition(boardId),
    enabled: !!boardId,
  });
}

export function useColumnCount(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId, 'column-count'],
    queryFn: () => getColumnCount(boardId),
    enabled: !!boardId,
  });
}