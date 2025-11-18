// components/RecentActivityFeed.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentActivity, type RecentActivity } from '@/lib/api/recent-activity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RecentActivityFeedProps {
  daysBack?: number;
  limit?: number;
  showLoadMore?: boolean;
  className?: string;
}

export default function RecentActivityFeed({
  daysBack = 30,
  limit = 50,
  showLoadMore = true,
  className,
}: RecentActivityFeedProps) {
  const [offset, setOffset] = useState(0);

  const {
    data: activityData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['recent-activity', daysBack, limit, offset],
    queryFn: () => getRecentActivity({ daysBack, limit, offset }),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const activities = activityData?.activities || [] as RecentActivity[] ;
  const hasMore = activityData?.hasMore || false;

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get icon component for activity type
  const getActivityIcon = (type: RecentActivity['type']) => {
    // You can import specific icons from lucide-react
    // For now, using a simple approach
    const icons: Record<string, string> = {
      issue_created: '🐛',
      issue_updated: '🔄',
      issue_closed: '✅',
      issue_reopened: '🔓',
      issue_commented: '💬',
      board_created: '📊',
      board_updated: '🔄',
      task_created: '📋',
      task_assigned: '👤',
      task_moved: '➡️',
      task_completed: '✅',
      task_deadline: '⏰',
    };

    return icons[type] || '📌';
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handleRefresh = () => {
    setOffset(0);
    refetch();
  };

  if (error) {
    return (
      <Card className={cn('border-[hsl(var(--border))] bg-[hsl(var(--card))]', className)}>
        <CardContent className="p-6">
          <p className="text-sm text-red-500">Failed to load recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-[hsl(var(--border))] bg-[hsl(var(--card))]', className)}>
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
            >
              Live
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && offset === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Clock className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))] font-medium">
              No recent activity
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Activity will appear here once your team starts working
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-[hsl(var(--border))]">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link || '#'}
                    className={cn(
                      'block p-4 hover:bg-[hsl(var(--hover-light))] transition-colors',
                      !activity.link && 'cursor-default'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-[hsl(var(--border))] shrink-0">
                        {activity.user_avatar ? (
                          <AvatarImage src={activity.user_avatar} alt={activity.user_name} />
                        ) : null}
                        <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm">
                          {activity.user_initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {activity.user_name}
                          </span>{' '}
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {activity.action}
                          </span>{' '}
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {activity.target}
                          </span>
                          {activity.issue_number && (
                            <span className="ml-1 text-[hsl(var(--primary))] font-semibold">
                              #{activity.issue_number}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                          {formatTimestamp(activity.created_at)}
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent))] shrink-0 text-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && showLoadMore && (
                <div className="p-4 border-t border-[hsl(var(--border))]">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}