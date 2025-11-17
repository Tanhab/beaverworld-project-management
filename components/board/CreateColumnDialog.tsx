'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateColumn, useNextColumnPosition } from '@/lib/hooks/useBoards';

const columnSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50),
});

type ColumnFormData = z.infer<typeof columnSchema>;

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
}

export function CreateColumnDialog({
  open,
  onOpenChange,
  boardId,
}: CreateColumnDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createColumn = useCreateColumn();
  const { data: nextPosition } = useNextColumnPosition(boardId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
  });

  const onSubmit = async (data: ColumnFormData) => {
    setIsLoading(true);
    try {
      await createColumn.mutateAsync({
        board_id: boardId,
        title: data.title,
        position: nextPosition || 1000,
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
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Create New Column</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}