'use client';

import { Activity, MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Board } from '@/lib/types/database';

interface BoardHeaderProps {
  board: Board;
  currentUserId: string;
  onAddColumn?: () => void;
  columnCount?: number;
  onEditBoard?: () => void;
  onDeleteBoard?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Development':
      return 'border-blue-500/70 text-blue-700 bg-blue-50/80';
    case 'Design':
      return 'border-purple-500/70 text-purple-700 bg-purple-50/80';
    case 'Testing':
      return 'border-green-500/70 text-green-700 bg-green-50/80';
    case 'Bug Fixes':
      return 'border-red-500/70 text-red-700 bg-red-50/80';
    default:
      return 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]';
  }
};

export function BoardHeader({ 
  board, 
  currentUserId, 
  onAddColumn, 
  columnCount = 0,
  onEditBoard,
  onDeleteBoard 
}: BoardHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-16 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-[1600px] px-5 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {board.title}
            </h1>
            {board.category && (
              <Badge
                variant="outline"
                className={cn(
                  'px-2.5 py-0.5 text-xs font-semibold',
                  getCategoryColor(board.category)
                )}
              >
                {board.category.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                {columnCount < 5 && onAddColumn && (
                  <>
                    <DropdownMenuItem 
                      onClick={onAddColumn} 
                      className="cursor-pointer gap-2 py-2.5 focus:bg-[hsl(var(--accent))]"
                    >
                      <Plus className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="font-medium">Add Column</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                  </>
                )}
                {onEditBoard && (
                  <>
                    <DropdownMenuItem 
                      onClick={onEditBoard} 
                      className="cursor-pointer gap-2 py-2.5 focus:bg-[hsl(var(--accent))]"
                    >
                      <Pencil className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="font-medium">Edit Board</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                  </>
                )}
                {onDeleteBoard && (
                  <DropdownMenuItem 
                    onClick={onDeleteBoard} 
                    className="cursor-pointer gap-2 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-semibold">Delete Board</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        {board.description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-3xl">
            {board.description}
          </p>
        )}
      </div>
    </div>
  );
}