"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useIssueByNumber } from "@/lib/hooks/useIssues";
import { useCurrentUser } from "@/lib/hooks/useUser";
import {
  Bug,
  Calendar as CalendarIcon,
  Edit2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  GitBranch,
  Package,
  AlertCircle,
  Clock,
  ArrowLeft,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatDeadline,
  getCategoryColor,
  getPriorityColor,
  getStatusConfig,
} from "@/lib/issues/utils";
import Link from "next/link";
import ActivityUpdateCard from "@/components/ActivityUpdateCard";
import ActivityCommentCard from "@/components/ActivityCommentCard";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueNumber = parseInt(params.issueNumber as string);

  const { data: issue, isLoading, error } = useIssueByNumber(issueNumber);
  const { data: currentUser } = useCurrentUser();

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="mx-auto max-w-[1400px] space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-[hsl(var(--muted))] rounded"></div>
          <div className="h-12 w-2/3 bg-[hsl(var(--muted))] rounded"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-64 bg-[hsl(var(--card))] rounded-xl"></div>
              <div className="h-96 bg-[hsl(var(--card))] rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-[hsl(var(--card))] rounded-xl"></div>
              <div className="h-64 bg-[hsl(var(--card))] rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Issue Not Found</h2>
            <p className="text-red-700 mb-6">
              {error?.message || `Issue #${issueNumber} does not exist.`}
            </p>
            <Button onClick={() => router.push("/issues")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;
  const isClosed = issue.status === "closed";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Bug className="h-8 w-8 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Issue #{issue.issue_number}
            </h1>
            <Badge
              variant="outline"
              className={cn("px-3 py-1 font-semibold", getCategoryColor(issue.category))}
            >
              {issue.category.toUpperCase()}
            </Badge>
          </div>

          {/* Title and Status Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={issue.title}
                    className="flex-1 text-3xl font-bold bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-4 py-2"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => setIsEditingTitle(false)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingTitle(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-3 group">
                  <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                    {issue.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                  >
                    <Edit2 className="h-5 w-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-base font-semibold",
                  statusConfig.bg,
                  statusConfig.color
                )}
              >
                <StatusIcon className="h-5 w-5" />
                {statusConfig.label}
              </div>
              {!isClosed && (
                <Badge
                  variant="outline"
                  className={cn("px-4 py-2 text-base font-semibold", getPriorityColor(issue.priority))}
                >
                  {issue.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-[hsl(var(--muted))] text-xs">
                  {issue.created_by_profile?.initials || "??"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {issue.created_by_profile?.username} opened this issue
              </span>
            </div>
            <span>•</span>
            <span className="font-medium">{formatDate(new Date(issue.created_at))}</span>
            <span>•</span>
            <span className="font-medium">
              Updated {formatDate(new Date(issue.updated_at))}
            </span>
            {issue.activities && issue.activities.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">
                    {issue.activities.filter((a) => a.activity_type === "comment").length}{" "}
                    comments
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="bg-[hsl(var(--border))]" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Description & Thread (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Description</h3>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div
                className="prose prose-sm max-w-none text-[hsl(var(--foreground))]"
                dangerouslySetInnerHTML={{ __html: issue.description || "No description provided." }}
              />
            </div>

            {/* Action Buttons */}
            {!isClosed ? (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Request Approval
                  </Button>
                  <Button variant="outline" className="border-green-200 text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Close Issue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-600">This issue is closed</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Closed by {issue.closed_by_profile?.username} on{" "}
                        {issue.closed_at && formatDate(new Date(issue.closed_at))}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-orange-200 text-orange-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reopen Issue
                  </Button>
                </div>
              </div>
            )}

            {/* Activity Thread */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Activity</h3>

              {/* Timeline container */}
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[hsl(var(--border))]"></div>

                <div className="relative space-y-0">
                  {/* Issue Created - Minimal Update */}
                  <ActivityUpdateCard
                    activityType="created"
                    userName={issue.created_by_profile?.username || "Unknown"}
                    userInitials={issue.created_by_profile?.initials || "??"}
                    timestamp={new Date(issue.created_at)}
                    content={{ message: "created this issue" }}
                  />

                  {/* Render activities */}
                  {issue.activities && issue.activities.length > 0 ? (
                    issue.activities.map((activity) => {
                      // Use comment card for comments and closures
                      if (activity.activity_type === "comment" || activity.activity_type === "closed") {
                        return (
                          <ActivityCommentCard
                            key={activity.id}
                            activityType={activity.activity_type as "comment" | "closed"}
                            userName="User Name" // TODO: Get from activity.user_id
                            userInitials="UN"
                            timestamp={new Date(activity.created_at)}
                            content={activity.content}
                            isAuthor={false} // TODO: Check if user is issue creator
                          />
                        );
                      }

                      // Use update card for all other activities
                      return (
                        <ActivityUpdateCard
                          key={activity.id}
                          activityType={activity.activity_type}
                          userName="User Name" // TODO: Get from activity.user_id
                          userInitials="UN"
                          timestamp={new Date(activity.created_at)}
                          content={activity.content}
                        />
                      );
                    })
                  ) : (
                    <div className="mt-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                      <p className="text-[hsl(var(--muted-foreground))]">
                        No additional activity yet. Be the first to comment!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (1/3 width) */}
          <div className="space-y-4">
            {/* Collaborators Card */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Collaborators
                </h3>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              {issue.assignees && issue.assignees.length > 0 ? (
                <div className="space-y-3">
                  {issue.assignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-[hsl(var(--border))]">
                          <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-bold">
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{assignee.username}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <XCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))] hover:text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No collaborators yet</p>
              )}
            </div>

            {/* Deadline Card */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Deadline
                </h3>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              {issue.deadline ? (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 font-semibold",
                    new Date(issue.deadline) < new Date()
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-600"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDeadline(new Date(issue.deadline))}</span>
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No deadline set</p>
              )}
            </div>

            {/* Build Version Card */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Build Version
                </h3>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              {issue.build_version ? (
                <div className="flex items-center gap-2 bg-[hsl(var(--muted))] rounded-lg px-3 py-2">
                  <Package className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="font-mono text-sm font-semibold">{issue.build_version}</span>
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Not specified</p>
              )}
            </div>

            {/* Solved Commit Card */}
            {issue.solved_commit_number && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Solved Commit
                  </h3>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-600 rounded-lg px-3 py-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="font-mono text-sm font-semibold">
                    {issue.solved_commit_number}
                  </span>
                </div>
              </div>
            )}

            {/* Scenario Card */}
            {issue.scenario_name && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Scenario
                  </h3>
                </div>
                <Link
                  href={`/scenarios/${issue.scenario_id}`}
                  className="block bg-purple-50 text-purple-600 rounded-lg px-3 py-2 hover:bg-purple-100 transition-colors"
                >
                  <span className="font-semibold text-sm">{issue.scenario_name}</span>
                </Link>
              </div>
            )}

            {/* More Actions */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full font-semibold">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 p-0 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-2">
                    <DropdownMenuItem className="cursor-pointer px-4 py-3 text-[15px] font-semibold gap-2 hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] rounded-lg">
                      <Edit2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                      Edit Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer px-4 py-3 text-[15px] font-semibold gap-2 hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] rounded-lg">
                      <Edit2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                      Change Category
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer px-4 py-3 text-[15px] font-semibold gap-2 hover:bg-[hsl(var(--hover-light))] focus-visible:bg-[hsl(var(--hover-light))] rounded-lg text-red-600">
                      <XCircle className="h-5 w-5" />
                      Archive Issue
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}