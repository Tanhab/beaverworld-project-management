'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, Trash2, Edit2, X, CheckCircle } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const { data: allUsers } = useUsers();
  
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const users = allUsers || [];

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

  const handleUpdateDeadline = async () => {
    if (!task) return;
    await updateTask.mutateAsync({
      taskId: task.id,
      input: { due_date: deadline || undefined },
    });
    setIsEditingDeadline(false);
  };

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((id) => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const handleRemoveAssignee = async (assigneeId: string) => {
    if (!task) return;
    const newAssignees = (task.assigned_to || []).filter(id => id !== assigneeId);
    await updateTask.mutateAsync({
      taskId: task.id,
      input: { assigned_to: newAssignees.length > 0 ? newAssignees : undefined },
    });
  };

  const handleSaveAssignees = async () => {
    if (!task) return;
    await updateTask.mutateAsync({
      taskId: task.id,
      input: { assigned_to: selectedAssignees.length > 0 ? selectedAssignees : undefined },
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTask.mutateAsync(task.id);
    onOpenChange(false);
  };

  useEffect(() => {
    if (task?.assigned_to) {
      setSelectedAssignees(task.assigned_to);
    } else {
      setSelectedAssignees([]);
    }
  }, [task?.assigned_to]);

  if (isLoading || !task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px] p-0">
          <SheetTitle className="sr-only">Loading task</SheetTitle>
          <div className="flex items-center justify-center h-full">
            <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && !task.is_completed;
  const assignedUsers = users.filter(u => task.assigned_to?.includes(u.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 flex flex-col bg-[hsl(var(--card))]">
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            {/* Title + Priority */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={task.is_completed ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleComplete}
                  className={cn(
                    "gap-2",
                    !task.is_completed && "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:text-green-800"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
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
                "text-3xl font-bold leading-tight text-[hsl(var(--foreground))]",
                task.is_completed && "line-through opacity-60"
              )}>
                {task.title}
              </SheetTitle>
            </div>

            {/* Created + Updated */}
            <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
              <span>
                Created {new Date(task.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {task.updated_at !== task.created_at && (
                <>
                  <span>•</span>
                  <span>
                    Updated {new Date(task.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </>
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
                    <Button size="sm" onClick={handleUpdateDescription} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
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

            {/* Deadline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                <Calendar className="h-4 w-4" />
                Deadline
              </div>
              {isEditingDeadline ? (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleUpdateDeadline} className="h-8 text-xs bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingDeadline(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {dueDate ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm font-medium px-3 py-1.5",
                        isOverdue
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-[hsl(var(--muted))]/50 text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
                      )}
                    >
                      {dueDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {isOverdue && ' (Overdue)'}
                    </Badge>
                  ) : (
                    <span className="text-sm text-[hsl(var(--muted-foreground))] italic">
                      No deadline set
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeadline(task.due_date || '');
                      setIsEditingDeadline(true);
                    }}
                    className="h-7 px-2"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Assigned To */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                <User className="h-4 w-4" />
                Assigned To
              </div>
              
              {/* Display assigned users as badges */}
              <div className="flex flex-wrap gap-2">
                {assignedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 gap-2 text-sm font-medium bg-[hsl(var(--muted))]/50"
                  >
                    <Avatar className="h-5 w-5">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold">
                        {user.initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleRemoveAssignee(user.id)}
                      className="rounded-full hover:bg-[hsl(var(--muted-foreground))]/20 p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {/* Add user button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2"
                    >
                      <User className="h-3 w-3" />
                      Add Member
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0 bg-[hsl(var(--card))]" align="start" sideOffset={5}>
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
                          <Avatar className="h-7 w-7">
                            {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                            <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-bold">
                              {user.initials || 'U'}
                            </AvatarFallback>
                          </Avatar>
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
                    <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                      <Button 
                        size="sm" 
                        className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                        onClick={handleSaveAssignees}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Delete Task</AlertDialogTitle>
                <AlertDialogDescription className="text-base text-[hsl(var(--muted-foreground))]">
                  Are you sure you want to delete <strong className="text-[hsl(var(--foreground))]">"{task.title}"</strong>? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete Task
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}