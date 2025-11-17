'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskColumn } from '@/components/board/TaskColumn';
import { TaskSheet } from '@/components/board/TaskSheet';
import { BoardHeader } from '@/components/board/BoardHeader';
import { CreateTaskDialog } from '@/components/board/CreateTaskDialog';
import { CreateColumnDialog } from '@/components/board/CreateColumnDialog';
import { useBoardWithDetails } from '@/lib/hooks/useBoards';
import { useReorderTasks } from '@/lib/hooks/useTasks';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverEvent as DndDragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, TaskColumnWithTasks } from '@/lib/types/database';
import { TaskCard } from '@/components/board/TaskCard';

const CURRENT_USER_ID = 'temp-user-id';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.board_id as string;

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string>('');
  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);

  const { data: board, isLoading } = useBoardWithDetails(boardId);
  const reorderTasks = useReorderTasks(boardId);

  // Cast columns to include tasks
  const columns = (board?.columns || []) as TaskColumnWithTasks[];

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const handleDragOver = (event: DndDragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Find the columns
    const activeColumn = columns.find((col) =>
      col.tasks?.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks?.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    // If dragging to different column
    if (activeColumn.id !== overColumn.id) {
      // This is handled in handleDragEnd
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source and destination columns
    const sourceColumn = columns.find((col) =>
      col.tasks?.some((task) => task.id === activeId)
    );
    const destColumn = columns.find(
      (col) => col.id === overId || col.tasks?.some((task) => task.id === overId)
    );

    if (!sourceColumn || !destColumn) return;

    const sourceTask = sourceColumn.tasks?.find((t) => t.id === activeId);
    if (!sourceTask) return;

    // If dropped on a column header (overId is column id)
    if (overId === destColumn.id) {
      if (sourceColumn.id === destColumn.id) return;

      // Move to the end of the destination column
      const destTasks = destColumn.tasks || [];
      const newPosition = destTasks.length > 0 
        ? destTasks[destTasks.length - 1].position + 1000 
        : 1000;

      reorderTasks.mutate([
        { id: activeId, column_id: destColumn.id, position: newPosition },
      ]);
      return;
    }

    // If dropped on another task
    const destTask = destColumn.tasks?.find((t) => t.id === overId);
    if (!destTask) return;

    if (sourceColumn.id === destColumn.id) {
      // Reordering within the same column
      const tasks = sourceColumn.tasks || [];
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      if (oldIndex === newIndex) return;

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

      // Update positions
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        column_id: sourceColumn.id,
        position: (index + 1) * 1000,
      }));

      reorderTasks.mutate(updates);
    } else {
      // Moving to a different column
      const destTasks = destColumn.tasks || [];
      const newIndex = destTasks.findIndex((t) => t.id === overId);

      // Insert the task at the new position
      const updatedDestTasks = [...destTasks];
      updatedDestTasks.splice(newIndex, 0, { ...sourceTask, column_id: destColumn.id });

      // Update positions for all tasks in the destination column
      const updates = updatedDestTasks.map((task, index) => ({
        id: task.id,
        column_id: destColumn.id,
        position: (index + 1) * 1000,
      }));

      reorderTasks.mutate(updates);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))] font-medium">
            Loading board...
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

  const columnIds = columns.map((col) => col.id);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Board Header */}
      <BoardHeader board={board} currentUserId={CURRENT_USER_ID} />

      {/* Kanban Board */}
      <div className="px-5 py-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
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
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            {columns.length < 5 && (
              <div className="w-80 shrink-0">
                <Button
                  variant="outline"
                  className="w-full h-12 border-dashed"
                  onClick={() => setCreateColumnDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="opacity-80 rotate-3 scale-105">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Sheet */}
      {selectedTaskId && (
        <TaskSheet
          taskId={selectedTaskId}
          boardId={boardId}
          userId={CURRENT_USER_ID}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        boardId={boardId}
        columnId={createTaskColumnId}
        userId={CURRENT_USER_ID}
      />

      {/* Create Column Dialog */}
      <CreateColumnDialog
        open={createColumnDialogOpen}
        onOpenChange={setCreateColumnDialogOpen}
        boardId={boardId}
      />
    </div>
  );
}