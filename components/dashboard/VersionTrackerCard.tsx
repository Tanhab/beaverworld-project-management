'use client';

import { useQuery } from '@tanstack/react-query';
import { GitBranch, GitMerge, Loader2, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getVersionHistory, type VersionEvent } from '@/lib/api/version-history';

function formatEventLabel(eventType: string): string {
  const lower = eventType.toLowerCase();
  if (lower === 'checkin') return 'CHECK-IN';
  if (lower === 'merge') return 'MERGE';
  if (lower === 'delete') return 'DELETE';
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
  if (name.includes('@')) {
    const username = name.split('@')[0];
    return username.slice(0, 2).toUpperCase();
  }
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join('')
    .slice(0, 2);
}

function extractBranchFromPath(path: string | null): string | null {
  if (!path) return null;
  const match = path.match(/br:([^@]+)/) || path.match(/^(.+)$/);
  return match ? match[1] : path;
}

export default function VersionTrackerCard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<VersionEvent[]>({
    queryKey: ['versionHistory'],
    queryFn: () => getVersionHistory(50),
    refetchInterval: 30000,
  });

  const versions = data ?? [];

  return (
    <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-[hsl(var(--primary))]" />
          Version Tracker
        </CardTitle>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Loader2 className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
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
                No UVCS events yet.
              </div>
            )}

            {versions.map((version) => {
              const isMerge = version.event_type === 'merge';
              const sourceBranch = extractBranchFromPath(version.merge_source);
              const destBranch = extractBranchFromPath(version.merge_destination);
              
              return (
                <div
                  key={version.id}
                  className="p-4 hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs flex items-center gap-1 ${
                            isMerge 
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-700' 
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-700'
                          }`}
                        >
                          {isMerge && <GitMerge className="h-3 w-3" />}
                          {formatEventLabel(version.event_type)}
                        </Badge>

                        {version.changeset_number && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-mono bg-slate-500/10 text-slate-700 border-slate-500/20"
                          >
                            cs:{version.changeset_number}
                          </Badge>
                        )}

                        {version.branch_name && !isMerge && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                          >
                            {version.branch_name}
                          </Badge>
                        )}

                        {version.has_conflicts && (
                          <Badge
                            variant="destructive"
                            className="text-xs flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Conflicts
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                        {formatTime(version.created_at)}
                      </span>
                    </div>

                    {isMerge && (sourceBranch || destBranch) && (
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {sourceBranch && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-700 border-green-500/20 font-mono"
                          >
                            {sourceBranch}
                          </Badge>
                        )}
                        {sourceBranch && destBranch && (
                          <span className="text-[hsl(var(--muted-foreground))]">→</span>
                        )}
                        {destBranch && (
                          <Badge
                            variant="outline"
                            className="bg-orange-500/10 text-orange-700 border-orange-500/20 font-mono"
                          >
                            {destBranch}
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-[hsl(var(--foreground))] line-clamp-2">
                      {version.comment || '(no comment)'}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6 border border-[hsl(var(--border))] shrink-0">
                          <AvatarFallback className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-semibold text-[10px]">
                            {initialsFromName(version.author)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                          {version.author ?? 'Unknown'}
                        </span>
                      </div>

                      {version.repo_name && (
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono whitespace-nowrap">
                          {version.repo_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}