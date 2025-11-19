import { createClient } from '@/lib/supabase/client';
import type {
  Board,
  BoardWithColumns,
  CreateBoardInput,
  UpdateBoardInput,
  BoardFilters,
  BoardSort,
} from '@/lib/types/database';
import { logger } from '../logger';

const supabase = createClient();

/**
 * Fetch all boards with optional filters and sorting
 */
export async function getBoards(
  filters?: BoardFilters,
  sort?: BoardSort
): Promise<BoardWithColumns[]> {
  try {
    let query = supabase
      .from('boards')
      .select(`
        *,
        created_by_profile:profiles!boards_created_by_fkey(
          id,
          username,
          initials,
          avatar_url
        )
      `);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.pinned_only) {
      query = query.eq('is_pinned', true);
    }

    // ALWAYS sort pinned first, then apply user sorting
    query = query.order('is_pinned', { ascending: false });
    
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching boards:', error);
      throw error;
    }

    // Count tasks for each board
    const boardsWithCounts = await Promise.all(
      (data || []).map(async (board: any) => {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('board_id', board.id);

        return {
          ...board,
          task_count: count || 0,
        };
      })
    );

    return boardsWithCounts;
  } catch (error) {
    logger.error('Failed to fetch boards:', error);
    throw error;
  }
}

/**
 * Fetch a single board by ID
 */
export async function getBoard(boardId: string): Promise<Board> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch a board with all its columns and tasks
 */
export async function getBoardWithDetails(boardId: string): Promise<BoardWithColumns> {
  const { data, error } = await supabase
    .from('boards')
    .select(`
      *,
      columns:task_columns(
        *,
        tasks(*)
      )
    `)
    .eq('id', boardId)
    .single();

  if (error) throw error;

  // Sort columns by position
  if (data.columns) {
    data.columns.sort((a: any, b: any) => a.position - b.position);
    
    // Sort tasks within each column by position
    data.columns.forEach((column: any) => {
      if (column.tasks) {
        column.tasks.sort((a: any, b: any) => a.position - b.position);
      }
    });
  }

  return data;
}

/**
 * Create a new board
 */
export async function createBoard(
  input: CreateBoardInput,
  userId: string
): Promise<Board> {
  const { data, error } = await supabase
    .from('boards')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category || 'General',
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a board with default columns
 */
export async function createBoardWithColumns(
  input: CreateBoardInput,
  userId: string
): Promise<BoardWithColumns> {
  // Create board first
  const board = await createBoard(input, userId);

  // Create default columns
  const defaultColumns = [
    { title: 'TODO', position: 1000 },
    { title: 'In Progress', position: 2000 },
    { title: 'Pending Review', position: 3000 },
    { title: 'Completed', position: 4000 },
  ];

  const { data: columns, error: columnsError } = await supabase
    .from('task_columns')
    .insert(
      defaultColumns.map((col) => ({
        board_id: board.id,
        title: col.title,
        position: col.position,
      }))
    )
    .select();

  if (columnsError) throw columnsError;

  return {
    ...board,
    columns: columns || [],
  };
}

/**
 * Update a board
 */
export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput
): Promise<Board> {
  const updateData: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  
  // Ensure category defaults to General if not provided
  if (updateData.category === undefined || updateData.category === null) {
    updateData.category = 'General';
  }

  const { data, error } = await supabase
    .from('boards')
    .update(updateData)
    .eq('id', boardId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a board (hard delete, cascades to columns and tasks)
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);

  if (error) throw error;
}

/**
 * Toggle board pin status
 */
export async function toggleBoardPin(
  boardId: string,
  isPinned: boolean
): Promise<Board> {
  return updateBoard(boardId, { is_pinned: isPinned });
}

/**
 * Get boards created by a specific user
 */
export async function getUserBoards(userId: string): Promise<BoardWithColumns[]> {
  return getBoards({ created_by: userId });
}

/**
 * Get pinned boards
 */
export async function getPinnedBoards(): Promise<BoardWithColumns[]> {
  return getBoards({ pinned_only: true });
}