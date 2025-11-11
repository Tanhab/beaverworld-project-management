'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Clock, MessageSquare, Paperclip, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    formatDate,
    formatDeadline,
    getCategoryColor,
    getPriorityColor,
    getStatusConfig,
} from '@/lib/issues/utils'
import { IssueWithRelations } from '@/lib/types/database'

interface IssueCardProps {
    issue: IssueWithRelations
}

export default function IssueCard({ issue }: IssueCardProps) {
    const statusConfig = getStatusConfig(issue.status)
    const StatusIcon = statusConfig.icon
    const isClosed = issue.status === 'closed'

    // Count comments from activities
    const commentCount = issue.activities?.filter(a => a.activity_type === 'comment').length || 0
    const imageCount = issue.images?.length || 0

    return (
        <Link href={`/issues/${issue.issue_number}`}>
            <div
                className={cn(
                    'group cursor-pointer rounded-xl border p-5 transition-all',
                    'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-lg',
                )}
            >
                {/* ===== Line 1 ===== */}
                <div
                    className={cn(
                        'flex items-center justify-between gap-3',
                        isClosed && 'opacity-60',
                    )}
                >
                    <div className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0 font-mono text-sm leading-none font-bold text-[hsl(var(--primary))]">
                            IS-{issue.issue_number}
                        </span>
                        <span className="shrink-0 text-[hsl(var(--muted-foreground))]">
                            —
                        </span>
                        <h3 className="truncate text-lg leading-tight font-bold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                            {issue.title}
                        </h3>
                        <Badge
                            variant="outline"
                            className={cn(
                                'ml-1 shrink-0 px-2 py-0.5 text-xs font-semibold',
                                getCategoryColor(issue.category),
                            )}
                        >
                            {issue.category.toUpperCase()}
                        </Badge>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold',
                                statusConfig.bg,
                                statusConfig.color,
                            )}
                        >
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig.label}
                        </div>
                        {!isClosed && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    'px-3 py-1.5 text-sm font-semibold',
                                    getPriorityColor(issue.priority),
                                )}
                            >
                                {issue.priority}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* ===== Line 2 - Description removed ===== */}

                {/* ===== Line 3 ===== */}
                <div
                    className={cn(
                        'mt-4 flex flex-wrap items-center justify-between gap-4',
                        isClosed && 'opacity-60',
                    )}
                >
                    <div className="flex items-center gap-4">
                        {/* Assignees with initials */}
                        {issue.assignees && issue.assignees.length > 0 && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                <div className="flex -space-x-2">
                                    {issue.assignees.slice(0, 3).map((user) => (
                                        <Avatar
                                            key={user.id}
                                            className="h-7 w-7 border-2 border-[hsl(var(--card))]"
                                            title={user.username}
                                        >
                                            <AvatarFallback className="bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                                                {user.initials || user.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {issue.assignees.length > 3 && (
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--muted))]">
                                            <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                                                +{issue.assignees.length - 3}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Comments & Attachments */}
                        <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                            {commentCount >= 0 && (
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="font-medium">
                                        {commentCount}
                                    </span>
                                </div>
                            )}
                            {imageCount >= 0 && (
                                <div className="flex items-center gap-1">
                                    <Paperclip className="h-4 w-4" />
                                    <span className="font-medium">
                                        {imageCount}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Deadline with better formatting */}
                        {issue.deadline && !isClosed && (
                            <div
                                className={cn(
                                    'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold',
                                    new Date(issue.deadline) < new Date()
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-blue-50 text-blue-600',
                                )}
                            >
                                <Clock className="h-3 w-3" />
                                {formatDeadline(new Date(issue.deadline))}
                            </div>
                        )}
                    </div>

                    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        Updated {formatDate(new Date(issue.updated_at))}
                    </div>
                </div>
            </div>
        </Link>
    )
}