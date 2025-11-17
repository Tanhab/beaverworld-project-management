'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  columnTitle: string;
}

export function DeleteColumnDialog({
  open,
  onOpenChange,
  onConfirm,
  columnTitle,
}: DeleteColumnDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Delete Column</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[hsl(var(--muted-foreground))]">
            Are you sure you want to delete the column <strong className="text-[hsl(var(--foreground))]">"{columnTitle}"</strong>? 
            All tasks in this column will be permanently deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Delete Column
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}