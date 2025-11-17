import { createClient } from '@/lib/supabase/client';
import type {
  TaskColumn,
  TaskColumnWithTasks,
  CreateColumnInput,
  UpdateColumnInput,
} from '@/lib/types/database';

const supabase = createClient();

/**
 * Fetch all columns for a board
 */
export async function getColumns(boardId: string): Promise<TaskColumn[]> {
  const { data, error } = await supabase
    .from('task_columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch columns with their tasks
 */
export async function getColumnsWithTasks(
  boardId: string
): Promise<TaskColumnWithTasks[]> {
  const { data, error } = await supabase
    .from('task_columns')
    .select(`
      *,
      tasks(*)
    `)
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;

  // Sort tasks within each column by position
  (data || []).forEach((column: any) => {
    if (column.tasks) {
      column.tasks.sort((a: any, b: any) => a.position - b.position);
    }
  });

  return data || [];
}

/**
 * Create a new column
 */
export async function createColumn(input: CreateColumnInput): Promise<TaskColumn> {
  const { data, error } = await supabase
    .from('task_columns')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a column
 */
export async function updateColumn(
  columnId: string,
  input: UpdateColumnInput
): Promise<TaskColumn> {
  const { data, error } = await supabase
    .from('task_columns')
    .update(input)
    .eq('id', columnId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a column (hard delete, cascades to tasks)
 */
export async function deleteColumn(columnId: string): Promise<void> {
  const { error } = await supabase
    .from('task_columns')
    .delete()
    .eq('id', columnId);

  if (error) throw error;
}

/**
 * Reorder columns
 */
export async function reorderColumns(
  boardId: string,
  updates: Array<{ id: string; position: number }>
): Promise<void> {
  // Update each column's position individually
  const updatePromises = updates.map(({ id, position }) =>
    supabase
      .from('task_columns')
      .update({ position })
      .eq('id', id)
      .eq('board_id', boardId)
  );

  const results = await Promise.all(updatePromises);
  
  const error = results.find(r => r.error)?.error;
  if (error) throw error;
}

/**
 * Get the next position for a new column in a board
 */
export async function getNextColumnPosition(boardId: string): Promise<number> {
  const { data, error } = await supabase
    .from('task_columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned", which is fine for empty boards
    throw error;
  }

  return data ? data.position + 1000 : 1000;
}

/**
 * Count columns in a board
 */
export async function getColumnCount(boardId: string): Promise<number> {
  const { count, error } = await supabase
    .from('task_columns')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', boardId);

  if (error) throw error;
  return count || 0;
}