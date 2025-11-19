'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateTask } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUser';
import { getNextTaskPosition } from '@/lib/api/tasks';
import { createTaskSchema, type CreateTaskFormData } from '@/lib/validations/task';
import type { TaskPriority } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  columnId: string;
  userId: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  boardId,
  columnId,
  userId,
}: CreateTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const createTask = useCreateTask(userId, boardId);
  const { data: users = [] } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'Medium',
    },
  });

  const priority = watch('priority');

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsLoading(true);
    try {
      // Use the API's getNextTaskPosition function instead of direct query
      const position = await getNextTaskPosition(columnId);

      // Clean up data - remove empty due_date
      const taskData: any = {
        ...data,
        board_id: boardId,
        column_id: columnId,
        position,
        assigned_to: selectedAssignees,
      };

      // Only include due_date if it has a value
      if (!taskData.due_date || taskData.due_date === '') {
        delete taskData.due_date;
      }

      await createTask.mutateAsync(taskData);
      reset();
      setSelectedAssignees([]);
      onOpenChange(false);
    } catch (error) {
      logger.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSelectedAssignees([]);
      onOpenChange(false);
    }
  };

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <DialogHeader className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 bg-[hsl(var(--card))]">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
              className="text-base"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add task description (optional)"
              rows={4}
              {...register('description')}
              className="text-base resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Assign To <span className="text-[hsl(var(--muted-foreground))] text-xs font-normal">(optional)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  {selectedAssignees.length === 0 ? (
                    <span className="text-[hsl(var(--muted-foreground))]">Select team members...</span>
                  ) : (
                    <span className="text-[hsl(var(--foreground))] font-medium">
                      {selectedAssignees.length} member{selectedAssignees.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0 bg-[hsl(var(--card))]" align="start">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
                  <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Assign Team Members</h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--accent))] cursor-pointer transition-colors border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <Checkbox
                        checked={selectedAssignees.includes(user.id)}
                        onCheckedChange={() => toggleAssignee(user.id)}
                      />
                      <span className={cn(
                        "text-sm font-medium flex-1",
                        selectedAssignees.includes(user.id) 
                          ? "text-[hsl(var(--primary))] font-bold" 
                          : "text-[hsl(var(--foreground))]"
                      )}>
                        {user.username}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold">
                Priority <span className="text-[hsl(var(--muted-foreground))] text-xs font-normal">(optional)</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value as TaskPriority)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-[hsl(var(--card))]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                  <SelectItem value="Low" className="py-2.5 cursor-pointer focus:bg-[hsl(var(--accent))]">
                    <span className="font-medium">Low</span>
                  </SelectItem>
                  <SelectItem value="Medium" className="py-2.5 cursor-pointer focus:bg-[hsl(var(--accent))]">
                    <span className="font-medium">Medium</span>
                  </SelectItem>
                  <SelectItem value="High" className="py-2.5 cursor-pointer focus:bg-[hsl(var(--accent))]">
                    <span className="font-medium">High</span>
                  </SelectItem>
                  <SelectItem value="Urgent" className="py-2.5 cursor-pointer focus:bg-[hsl(var(--accent))]">
                    <span className="font-medium">Urgent</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-semibold">
                Due Date <span className="text-[hsl(var(--muted-foreground))] text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                className="text-base"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}