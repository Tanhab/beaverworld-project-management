"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/issues/utils";
import { CheckCircle2, MessageSquare, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCommentCardProps {
  activityType: "comment" | "closed";
  userName: string;
  userInitials: string;
  timestamp: Date;
  content: any;
  isAuthor?: boolean;
}

export default function ActivityCommentCard({
  activityType,
  userName,
  userInitials,
  timestamp,
  content,
  isAuthor = false,
}: ActivityCommentCardProps) {
  return (
    <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 mt-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 border-2 border-[hsl(var(--card))] relative z-10 bg-[hsl(var(--background))] shrink-0">
          <AvatarFallback
            className={cn(
              "font-bold text-xs",
              activityType === "closed"
                ? "bg-green-600 text-white"
                : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            )}
          >
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-base">{userName}</span>
            {isAuthor && (
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-200"
              >
                Author
              </Badge>
            )}
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {activityType === "closed" ? "closed this issue" : "commented"}
            </span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">•</span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatDate(timestamp)}
            </span>
          </div>

          {/* Comment Content */}
          {content.text && (
            <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg p-3">
              <div
                className="prose prose-sm max-w-none text-[hsl(var(--foreground))]"
                dangerouslySetInnerHTML={{ __html: content.text }}
              />
            </div>
          )}

          {/* Solved commit info for closed issues */}
          {activityType === "closed" && content.solved_commit && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-[hsl(var(--muted-foreground))]">Marked as resolved in</span>
              <div className="flex items-center gap-1.5 bg-green-50 text-green-600 rounded-md px-2 py-1 font-mono text-xs font-semibold">
                <GitBranch className="h-3 w-3" />
                {content.solved_commit}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}