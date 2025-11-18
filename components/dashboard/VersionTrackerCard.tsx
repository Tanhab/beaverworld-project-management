'use client';

import { useQuery } from '@tanstack/react-query';
import { GitBranch, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getVersionHistory, type VersionEvent } from '@/lib/api/version-history';

function formatEventLabel(eventType: string): string {
  const lower = eventType.toLowerCase();
  if (lower.includes('check')) return 'CHECK-IN';
  if (lower.includes('merge')) return 'MERGE';
  if (lower.includes('delete') || lower.includes('rm')) return 'DELETE';
  return eventType.toUpperCase();
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function initialsFromName(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join('')
    .slice(0, 3);
}

export default function VersionTrackerCard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<VersionEvent[]>({
    queryKey: ['versionHistory'],
    queryFn: () => getVersionHistory(50),
  });

  const versions = data ?? [];

  return (
    <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4 flex items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-[hsl(var(--primary))]" />
          Version Tracker
        </CardTitle>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Loader2
            className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-[hsl(var(--border))]">
            {isLoading && (
              <div className="p-4 text-sm text-[hsl(var(--muted-foreground))]">
                Loading version history…
              </div>
            )}

            {isError && (
              <div className="p-4 text-sm text-red-500">
                Failed to load version history.
              </div>
            )}

            {!isLoading && !isError && versions.length === 0 && (
              <div className="p-4 text-sm text-[hsl(var(--muted-foreground))]">
                No UVCS events yet. Once you configure the webhook and do a
                check-in / merge / delete, they will appear here.
              </div>
            )}

            {versions.map((version) => (
              <div
                key={version.id}
                className="p-4 hover:bg-[hsl(var(--hover-light))] transition-colors"
              >
                <div className="space-y-3">
                  {/* Top row: event type / branch / time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                      >
                        {formatEventLabel(version.event_type)}
                      </Badge>

                      {version.branch_name && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                        >
                          {version.branch_name}
                        </Badge>
                      )}
                    </div>

                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                      {formatTime(version.created_at)}
                    </span>
                  </div>

                  {/* Comment / message */}
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-2">
                    {version.comment || '(no comment)'}
                  </p>

                  {/* Author / repo */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-[hsl(var(--border))]">
                        <AvatarFallback className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-semibold text-[10px]">
                          {initialsFromName(version.author)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                        {version.author ?? 'Unknown author'}
                      </span>
                    </div>

                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                      {version.repo_name ?? ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
