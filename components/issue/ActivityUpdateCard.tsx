"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/issues/utils";
import { 
  UserPlus, 
  UserMinus, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Edit2,
  GitBranch,
  XCircle,
  Calendar,
  Package,
  Grid2X2Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityUpdateCardProps {
  activityType: string;
  userName: string;
  userInitials: string;
  timestamp: Date;
  content: any;
}

export default function ActivityUpdateCard({
  activityType,
  userName,
  userInitials,
  timestamp,
  content,
}: ActivityUpdateCardProps) {
  // Determine icon and message based on activity type
  const getActivityDetails = () => {
    switch (activityType) {
      case "created":
        return {
          icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
          message: "created this issue",
        };

      case "status_change":
        const statusIcons = {
          open: <AlertCircle className="h-4 w-4 text-orange-600" />,
          pending_approval: <Clock className="h-4 w-4 text-blue-600" />,
          closed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        };
        
        // Special message for pending approval
        if (content.new_status === "pending_approval") {
          return {
            icon: statusIcons[content.new_status as keyof typeof statusIcons] || <Edit2 className="h-4 w-4" />,
            message: (
              <>
                marked as pending approval
                <span className="block text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  This will be discussed in the next meeting
                </span>
              </>
            ),
          };
        }
        
        return {
          icon: statusIcons[content.new_status as keyof typeof statusIcons] || <Edit2 className="h-4 w-4" />,
          message: (
            <>
              changed the status to{" "}
              <Badge variant="outline" className="font-semibold">
                {content.new_status}
              </Badge>
            </>
          ),
        };

      case "assignee_add":
        return {
          icon: <UserPlus className="h-4 w-4 text-green-600" />,
          message: (
            <>
              added{" "}
              <span className="font-semibold">{content.added_user_name}</span> as a
              collaborator
            </>
          ),
        };

      case "assignee_remove":
        return {
          icon: <UserMinus className="h-4 w-4 text-red-600" />,
          message: (
            <>
              removed{" "}
              <span className="font-semibold">{content.removed_user_name}</span> from
              collaborators
            </>
          ),
        };

      case "field_update":
        const fieldIcons = {
          priority: <AlertCircle className="h-4 w-4 text-orange-600" />,
          deadline: <Calendar className="h-4 w-4 text-blue-600" />,
          category: <Grid2X2Check className="h-4 w-4 text-purple-600" />,
          build_version: <Package className="h-4 w-4 text-blue-600" />,
          solved_commit_number: <GitBranch className="h-4 w-4 text-green-600" />,
          title: <Edit2 className="h-4 w-4 text-gray-600" />,
          description: <Edit2 className="h-4 w-4 text-gray-600" />,
        };

        const fieldLabels = {
          priority: "priority",
          deadline: "deadline",
          category: "category",
          build_version: "build version",
          solved_commit_number: "solved commit",
          title: "title",
          description: "description",
        };

        return {
          icon: fieldIcons[content.field as keyof typeof fieldIcons] || <Edit2 className="h-4 w-4" />,
          message: (
            <>
              changed the {fieldLabels[content.field as keyof typeof fieldLabels] || content.field}
              {content.old_value && (
                <>
                  {" from "}
                  <span className="font-semibold line-through">{content.old_value}</span>
                </>
              )}
              {content.new_value && (
                <>
                  {" to "}
                  <Badge variant="outline" className="font-semibold">
                    {content.new_value}
                  </Badge>
                </>
              )}
            </>
          ),
        };

      case "reopened":
        return {
          icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
          message: "reopened this issue",
        };

      default:
        return {
          icon: <Edit2 className="h-4 w-4 text-gray-600" />,
          message: activityType,
        };
    }
  };

  const { icon, message } = getActivityDetails();

  return (
    <div className="relative flex items-center gap-3 py-3">
      {/* Small icon instead of full avatar */}
      <div className="h-8 w-8 rounded-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] flex items-center justify-center shrink-0 relative z-10">
        {icon}
      </div>

      {/* Condensed info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[hsl(var(--foreground))]">
          <span className="font-semibold">{userName}</span>{" "}
          <span className="text-[hsl(var(--muted-foreground))]]">{message}</span>
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          {formatDate(timestamp)}
        </p>
      </div>
    </div>
  );
}