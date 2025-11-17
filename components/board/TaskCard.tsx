'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, MessageSquare, GripVertical, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsers } from '@/lib/hooks/useUser';
import type { Task } from '@/lib/types/database';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
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

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { data: allUsers } = useUsers();
  const users = allUsers || [];
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  
  // Get actual user objects
  const assignedUsers = users.filter(u => task.assigned_to?.includes(u.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group cursor-pointer rounded-xl border p-4 transition-all bg-[hsl(var(--card))] relative',
        'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:shadow-md',
        isDragging && 'opacity-50 shadow-2xl scale-105',
        task.is_completed && 'opacity-60'
      )}
    >
      {/* Completion Checkbox - Top Right */}
      <div className="absolute top-3 right-3">
        {task.is_completed ? (
          <CheckSquare className="h-5 w-5 text-green-600" />
        ) : (
          <Square className="h-5 w-5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Drag Handle + Title */}
      <div className="flex items-start gap-2 mb-3">
        <button
          type="button"
          className="shrink-0 mt-1 cursor-grab active:cursor-grabbing text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <div className="flex-1 min-w-0 pr-6" onClick={onClick}>
          <h4 className={cn(
            "text-base font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 mb-2",
            task.is_completed && "line-through"
          )}>
            {task.title}
          </h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold',
                  getPriorityColor(task.priority)
                )}
              >
                {task.priority}
              </Badge>

              {/* Due Date */}
              {dueDate && (
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md",
                  isOverdue 
                    ? "bg-red-50 text-red-700" 
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                )}>
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Assigned Users */}
            {assignedUsers.length > 0 && (
              <div className="flex items-center -space-x-2">
                {assignedUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-6 w-6 border-2 border-[hsl(var(--card))]">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold">
                      {user.initials || user.username?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {assignedUsers.length > 3 && (
                  <div className="h-6 w-6 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--muted))] flex items-center justify-center text-[10px] font-bold">
                    +{assignedUsers.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}