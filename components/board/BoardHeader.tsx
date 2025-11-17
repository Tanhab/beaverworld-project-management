'use client';

import { ArrowLeft, Pin, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Board } from '@/lib/types/database';
import { useToggleBoardPin } from '@/lib/hooks/useBoards';

interface BoardHeaderProps {
  board: Board;
  currentUserId: string;
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

export function BoardHeader({ board, currentUserId }: BoardHeaderProps) {
  const router = useRouter();
  const togglePin = useToggleBoardPin();

  const handleTogglePin = async () => {
    try {
      await togglePin.mutateAsync({
        boardId: board.id,
        isPinned: !board.is_pinned,
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  return (
    <div className="sticky top-16 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-[1600px] px-5 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/boards')}
              className="h-9 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="h-6 w-px bg-[hsl(var(--border))]" />

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {board.title}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  'px-2.5 py-0.5 text-xs font-semibold',
                  getCategoryColor(board.category? board.category : "Default")
                )}
              >
                {board.category?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={board.is_pinned ? 'default' : 'outline'}
              size="sm"
              onClick={handleTogglePin}
              className="gap-2"
            >
              <Pin className={cn('h-4 w-4', board.is_pinned && 'fill-current')} />
              {board.is_pinned ? 'Pinned' : 'Pin'}
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Share
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
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