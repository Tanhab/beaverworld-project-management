'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateColumn, useNextColumnPosition, useBoardWithDetails } from '@/lib/hooks/useBoards';

const columnSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50),
});

type ColumnFormData = z.infer<typeof columnSchema>;

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  position?: 'end' | 'left' | 'right';
  referenceColumnId?: string;
}

export function CreateColumnDialog({
  open,
  onOpenChange,
  boardId,
  position = 'end',
  referenceColumnId = '',
}: CreateColumnDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createColumn = useCreateColumn();
  const { data: nextPosition } = useNextColumnPosition(boardId);
  const { data: board } = useBoardWithDetails(boardId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
  });

  const calculatePosition = (): number => {
    if (position === 'end') {
      return nextPosition || 1000;
    }

    // CRITICAL: Sort columns by position first
    const columns = (board?.columns || []).sort((a, b) => a.position - b.position);
    const refColumnIndex = columns.findIndex(col => col.id === referenceColumnId);
    
    if (refColumnIndex === -1) {
      return nextPosition || 1000;
    }

    const refColumn = columns[refColumnIndex];

    if (position === 'left') {
      // Insert before reference column
      const prevColumn = refColumnIndex > 0 ? columns[refColumnIndex - 1] : null;
      if (prevColumn) {
        // Position between previous and reference
        const gap = refColumn.position - prevColumn.position;
        // Ensure minimum gap of 1
        return gap > 1 ? prevColumn.position + Math.floor(gap / 2) : prevColumn.position + 1;
      } else {
        // Position before first column (ensure positive)
        return Math.max(1, refColumn.position - 1000);
      }
    } else if (position === 'right') {
      // Insert after reference column
      const nextColumn = refColumnIndex < columns.length - 1 ? columns[refColumnIndex + 1] : null;
      if (nextColumn) {
        // Position between reference and next
        const gap = nextColumn.position - refColumn.position;
        // Ensure minimum gap of 1
        return gap > 1 ? refColumn.position + Math.floor(gap / 2) : refColumn.position + 1;
      } else {
        // Position after last column
        return refColumn.position + 1000;
      }
    }

    return nextPosition || 1000;
  };

  const getDialogTitle = () => {
    if (position === 'left') return 'Add Column to Left';
    if (position === 'right') return 'Add Column to Right';
    return 'Create New Column';
  };

  const getDialogDescription = () => {
    const refColumn = board?.columns?.find(col => col.id === referenceColumnId);
    if (position === 'left' && refColumn) {
      return `Create a new column to the left of "${refColumn.title}"`;
    }
    if (position === 'right' && refColumn) {
      return `Create a new column to the right of "${refColumn.title}"`;
    }
    return 'Add a new column to organize your tasks';
  };

  const onSubmit = async (data: ColumnFormData) => {
    setIsLoading(true);
    try {
      const columnPosition = calculatePosition();
      await createColumn.mutateAsync({
        board_id: boardId,
        title: data.title,
        position: columnPosition,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <DialogHeader className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 bg-[hsl(var(--card))]">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Column Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., In Progress, Review, Done"
              {...register('title')}
              className="text-base"
              disabled={isLoading}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
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
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}