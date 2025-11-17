'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical, Edit2, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
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
  onAddColumnLeft?: () => void;
  onAddColumnRight?: () => void;
  onDeleteColumn?: () => void;
}

export function TaskColumn({
  column,
  boardId,
  onTaskClick,
  onCreateTask,
  onEditColumn,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteColumn,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks?.map((task) => task.id) || [];
  const taskCount = column.tasks?.length || 0;

  return (
    <div className="w-80 shrink-0 flex flex-col h-[calc(100vh-220px)]">
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
                className="h-8 w-8 p-0 hover:bg-[hsl(var(--accent))] relative z-10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-[hsl(var(--card))] border-[hsl(var(--border))]"
              style={{ zIndex: 9999 }}
              sideOffset={5}
            >
              {onEditColumn && (
                <DropdownMenuItem 
                  onClick={onEditColumn} 
                  className="cursor-pointer py-2.5 focus:bg-[hsl(var(--accent))] font-semibold gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit column name
                </DropdownMenuItem>
              )}
              
              {(onAddColumnLeft || onAddColumnRight) && (
                <>
                  <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                  {onAddColumnLeft && (
                    <DropdownMenuItem 
                      onClick={onAddColumnLeft} 
                      className="cursor-pointer py-2.5 focus:bg-[hsl(var(--accent))] font-semibold gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Add column to left
                    </DropdownMenuItem>
                  )}
                  {onAddColumnRight && (
                    <DropdownMenuItem 
                      onClick={onAddColumnRight} 
                      className="cursor-pointer py-2.5 focus:bg-[hsl(var(--accent))] font-semibold gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Add column to right
                    </DropdownMenuItem>
                  )}
                </>
              )}
              
              {onDeleteColumn && (
                <>
                  <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                  <DropdownMenuItem
                    onClick={onDeleteColumn}
                    className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 font-semibold gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete column
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* IMPROVED: Much larger drop zone with better visual feedback */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-xl p-3 space-y-3 transition-all',
          'bg-[hsl(var(--muted))]/30 border-2 border-dashed',
          'min-h-[200px]',
          isOver 
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 scale-[1.02]' 
            : 'border-[hsl(var(--border))]'
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
              {isOver ? 'Drop task here' : 'No tasks yet'}
            </p>
            {!isOver && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateTask}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}