'use client';

import { useState } from 'react';
import { X, Calendar, User, Flag, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskSheetProps {
  taskId: string;
  boardId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return 'border-orange-500/70 text-orange-700 bg-orange-50/80';
    case 'High':
      return 'border-red-500/70 text-red-700 bg-red-50/80';
    case 'Medium':
      return 'border-yellow-500/70 text-yellow-700 bg-yellow-50/80';
    case 'Low':
      return 'border-blue-500/70 text-blue-700 bg-blue-50/80';
    default:
      return 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]';
  }
};

export function TaskSheet({ taskId, boardId, userId, open, onOpenChange }: TaskSheetProps) {
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask(userId, boardId);
  const deleteTask = useDeleteTask(boardId);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  const handleToggleComplete = async () => {
    if (!task) return;
    await updateTask.mutateAsync({
      taskId: task.id,
      input: { is_completed: !task.is_completed },
    });
  };

  const handleUpdateDescription = async () => {
    if (!task) return;
    await updateTask.mutateAsync({
      taskId: task.id,
      input: { description },
    });
    setIsEditingDescription(false);
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    await deleteTask.mutateAsync(task.id);
    onOpenChange(false);
  };

  if (isLoading || !task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px] p-0">
          <div className="flex items-center justify-center h-full">
            <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && !task.is_completed;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-[hsl(var(--border))] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={task.is_completed ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleComplete}
                  className="shrink-0 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {task.is_completed ? 'Completed' : 'Mark Complete'}
                </Button>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold',
                    getPriorityColor(task.priority)
                  )}
                >
                  {task.priority}
                </Badge>
              </div>
              <SheetTitle className={cn(
                "text-2xl font-bold leading-tight pr-8",
                task.is_completed && "line-through opacity-60"
              )}>
                {task.title}
              </SheetTitle>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              {dueDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </div>
                  <div className={cn(
                    "text-base font-medium px-3 py-2 rounded-lg border",
                    isOverdue
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
                  )}>
                    {dueDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {isOverdue && ' (Overdue)'}
                  </div>
                </div>
              )}

              {/* Assigned Users */}
              {task.assigned_to && task.assigned_to.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    <User className="h-4 w-4" />
                    Assigned To
                  </div>
                  <div className="flex items-center gap-2">
                    {task.assigned_to.slice(0, 3).map((userId, idx) => (
                      <Avatar key={idx} className="h-8 w-8 border-2 border-[hsl(var(--border))]">
                        <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-bold">
                          {userId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assigned_to.length > 3 && (
                      <div className="h-8 w-8 rounded-full border-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold">
                        +{task.assigned_to.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Description</h3>
                {!isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDescription(task.description || '');
                      setIsEditingDescription(true);
                    }}
                    className="gap-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="text-base resize-none"
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleUpdateDescription}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingDescription(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-base text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </div>
              )}
            </div>

            <Separator />

            {/* Activity Log */}
            <div className="space-y-3">
              <h3 className="text-base font-bold">Activity</h3>
              <div className="space-y-2">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Created {new Date(task.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                {task.updated_at !== task.created_at && (
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Last updated {new Date(task.updated_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}