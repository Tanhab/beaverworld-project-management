'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import type { TaskColumnWithTasks } from '@/lib/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskColumnProps {
  column: TaskColumnWithTasks;
  boardId: string;
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
}

export function TaskColumn({
  column,
  boardId,
  onTaskClick,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
}: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks?.map((task) => task.id) || [];
  const taskCount = column.tasks?.length || 0;

  return (
    <div className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-200px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base font-bold text-[hsl(var(--foreground))] truncate">
            {column.title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 text-xs font-bold rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
            {taskCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateTask}
            className="h-8 w-8 p-0 hover:bg-[hsl(var(--accent))]"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[hsl(var(--accent))]"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEditColumn && (
                <DropdownMenuItem onClick={onEditColumn} className="cursor-pointer">
                  Edit column
                </DropdownMenuItem>
              )}
              {onDeleteColumn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDeleteColumn}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    Delete column
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-xl p-3 space-y-3',
          'bg-[hsl(var(--muted))]/30 border-2 border-dashed border-[hsl(var(--border))]',
          'min-h-[200px]'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>

        {taskCount === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium mb-3">
              No tasks yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateTask}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}