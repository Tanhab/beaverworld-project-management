'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TaskColumn } from '@/components/board/TaskColumn';
import { TaskSheet } from '@/components/board/TaskSheet';
import { BoardHeader } from '@/components/board/BoardHeader';
import { CreateTaskDialog } from '@/components/board/CreateTaskDialog';
import { CreateColumnDialog } from '@/components/board/CreateColumnDialog';
import { CreateBoardDialog } from '@/components/board/CreateBoardDialog';
import { EditColumnDialog } from '@/components/board/EditColumnDialog';
import { DeleteColumnDialog } from '@/components/board/DeleteColumnDialog';
import { useBoardWithDetails, useDeleteBoard, useDeleteColumn, useUpdateBoard, useUpdateColumn } from '@/lib/hooks/useBoards';
import { useReorderTasks } from '@/lib/hooks/useTasks';
import { useCurrentUser } from '@/lib/hooks/useUser';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CreateBoardInput, Task, TaskColumnWithTasks } from '@/lib/types/database';
import { TaskCard } from '@/components/board/TaskCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.board_id as string;

  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id || '';

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string>('');
  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);
  const [createColumnPosition, setCreateColumnPosition] = useState<'end' | 'left' | 'right'>('end');
  const [createColumnReferenceId, setCreateColumnReferenceId] = useState<string>('');
  
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string>('');
  const [editingColumnTitle, setEditingColumnTitle] = useState<string>('');
  
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string>('');
  const [deletingColumnTitle, setDeletingColumnTitle] = useState<string>('');

  const { data: board, isLoading } = useBoardWithDetails(boardId);
  const reorderTasks = useReorderTasks(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  
  // Board mutations (reuse pattern from boards page)
  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();
  
  // Board edit/delete state
  const [editingBoard, setEditingBoard] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState(false);

  // CRITICAL: Sort columns by position (fixes new left/right columns)
  const columns = ((board?.columns || []) as TaskColumnWithTasks[])
    .sort((a, b) => a.position - b.position);

  // IMPROVED: Better collision detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Very small distance for instant drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks || [])
      .find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This helps with visual feedback during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source column
    const sourceColumn = columns.find((col) =>
      col.tasks?.some((task) => task.id === activeId)
    );

    if (!sourceColumn) return;

    const sourceTask = sourceColumn.tasks?.find((t) => t.id === activeId);
    if (!sourceTask) return;

    // Check if dropped on a column (not a task)
    const destColumn = columns.find((col) => col.id === overId);
    
    if (destColumn) {
      // Dropped on column drop zone
      if (sourceColumn.id === destColumn.id) return;

      const destTasks = destColumn.tasks || [];
      const newPosition = destTasks.length > 0 
        ? destTasks[destTasks.length - 1].position + 1000 
        : 1000;

      reorderTasks.mutate([
        { id: activeId, column_id: destColumn.id, position: newPosition },
      ]);
      return;
    }

    // Dropped on a task
    const destColumnForTask = columns.find((col) =>
      col.tasks?.some((task) => task.id === overId)
    );

    if (!destColumnForTask) return;

    const destTask = destColumnForTask.tasks?.find((t) => t.id === overId);
    if (!destTask) return;

    if (sourceColumn.id === destColumnForTask.id) {
      // Same column reorder
      const tasks = sourceColumn.tasks || [];
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      if (oldIndex === newIndex) return;

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        column_id: sourceColumn.id,
        position: (index + 1) * 1000,
      }));

      reorderTasks.mutate(updates);
    } else {
      // Cross-column move
      const destTasks = destColumnForTask.tasks || [];
      const newIndex = destTasks.findIndex((t) => t.id === overId);

      const updatedDestTasks = [...destTasks];
      updatedDestTasks.splice(newIndex, 0, { ...sourceTask, column_id: destColumnForTask.id });

      const updates = updatedDestTasks.map((task, index) => ({
        id: task.id,
        column_id: destColumnForTask.id,
        position: (index + 1) * 1000,
      }));

      reorderTasks.mutate(updates);
    }
  };

  const columnIds = columns.map((col) => col.id);

  const handleEditColumn = (columnId: string, columnTitle: string) => {
    setEditingColumnId(columnId);
    setEditingColumnTitle(columnTitle);
    setEditColumnDialogOpen(true);
  };

  const handleSaveColumnEdit = async (newTitle: string) => {
    if (editingColumnId && newTitle.trim()) {
      await updateColumn.mutateAsync({
        columnId: editingColumnId,
        input: { title: newTitle },
      });
      setEditColumnDialogOpen(false);
    }
  };

  const handleDeleteColumn = (columnId: string, columnTitle: string) => {
    setDeletingColumnId(columnId);
    setDeletingColumnTitle(columnTitle);
    setDeleteColumnDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingColumnId) {
      await deleteColumn.mutateAsync(deletingColumnId);
      setDeleteColumnDialogOpen(false);
    }
  };

  const handleAddColumnLeft = (columnId: string) => {
    setCreateColumnPosition('left');
    setCreateColumnReferenceId(columnId);
    setCreateColumnDialogOpen(true);
  };

  const handleAddColumnRight = (columnId: string) => {
    setCreateColumnPosition('right');
    setCreateColumnReferenceId(columnId);
    setCreateColumnDialogOpen(true);
  };

  // Board edit/delete handlers (reuse pattern from boards page)
  const handleUpdateBoard = async (data: CreateBoardInput) => {
    if (board) {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        input: data,
      });
      setEditingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (board) {
      await deleteBoardMutation.mutateAsync(board.id);
      setDeletingBoard(false);
      router.push('/boards');
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))] font-medium">
            {isLoading ? 'Loading board...' : 'Loading user...'}
          </p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <Button onClick={() => router.push('/boards')}>Back to Boards</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <BoardHeader 
        board={board} 
        currentUserId={userId}
        onAddColumn={() => {
          setCreateColumnPosition('end');
          setCreateColumnReferenceId('');
          setCreateColumnDialogOpen(true);
        }}
        columnCount={columns.length}
        onEditBoard={() => setEditingBoard(true)}
        onDeleteBoard={() => setDeletingBoard(true)}
      />

      <div className="overflow-x-auto">
        <div className="mx-auto max-w-[1600px] px-5 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-fit pb-4">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {columns.map((column) => (
                  <TaskColumn
                    key={column.id}
                    column={column}
                    boardId={boardId}
                    onTaskClick={setSelectedTaskId}
                    onCreateTask={() => {
                      setCreateTaskColumnId(column.id);
                      setCreateTaskDialogOpen(true);
                    }}
                    onEditColumn={() => handleEditColumn(column.id, column.title)}
                    onAddColumnLeft={() => handleAddColumnLeft(column.id)}
                    onAddColumnRight={() => handleAddColumnRight(column.id)}
                    onDeleteColumn={() => handleDeleteColumn(column.id, column.title)}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeTask && (
                <div className="opacity-70 rotate-3 scale-105">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {selectedTaskId && (
        <TaskSheet
          taskId={selectedTaskId}
          boardId={boardId}
          userId={userId}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        boardId={boardId}
        columnId={createTaskColumnId}
        userId={userId}
      />

      <CreateColumnDialog
        open={createColumnDialogOpen}
        onOpenChange={setCreateColumnDialogOpen}
        boardId={boardId}
        position={createColumnPosition}
        referenceColumnId={createColumnReferenceId}
      />

      <EditColumnDialog
        open={editColumnDialogOpen}
        onOpenChange={setEditColumnDialogOpen}
        columnTitle={editingColumnTitle}
        onSave={handleSaveColumnEdit}
      />

      <DeleteColumnDialog
        open={deleteColumnDialogOpen}
        onOpenChange={setDeleteColumnDialogOpen}
        columnTitle={deletingColumnTitle}
        onConfirm={handleConfirmDelete}
      />

      {/* Edit Board Dialog (same pattern as boards page) */}
      <CreateBoardDialog
        open={editingBoard}
        onOpenChange={(open) => !open && setEditingBoard(false)}
        onSubmit={handleUpdateBoard}
        initialData={board ? {
          title: board.title,
          description: board.description || undefined,
          category: board.category || 'General',
        } : undefined}
        isEditing={true}
      />

      {/* Delete Board Dialog (same pattern as boards page) */}
      <AlertDialog open={deletingBoard} onOpenChange={() => setDeletingBoard(false)}>
        <AlertDialogContent className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(var(--foreground))]">Delete Board?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--muted-foreground))]">
              Are you sure you want to delete "{board?.title}"? This will
              permanently delete the board along with all its columns and tasks. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--border))]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}