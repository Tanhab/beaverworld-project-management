// lib/issues/utils.ts
// UPDATED VERSION - Replace your existing file

import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { IssueWithRelations } from "../types/database";

export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]";
    }
  };

  export const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", label: "Open" };
      case "pending_approval":
        return { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Pending Approval" };
      case "closed":
        return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Closed" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50", label: status };
    }
  };

  export const getCategoryColor = (category: string) => {
    switch (category) {
      case "ui" :
      case "UI":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "dev":
      case "DEV":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "media":
      case "MEDIA":
        return "bg-pink-50 text-pink-600 border-pink-200";
      default:
        return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
    }
  };

  export const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /**
   * Sort issues with status priority (open/pending first, closed last)
   * When no explicit sort is selected, defaults to status-aware sorting
   */
  export function sortIssues(
    issues: IssueWithRelations[],
    sortBy: string,
    hasActiveFilters: boolean = false
  ): IssueWithRelations[] {
    const issuesCopy = [...issues];
    
    // Status order: open and pending_approval first, closed last
    const getStatusOrder = (status: string): number => {
      switch (status) {
        case "open":
          return 0;
        case "pending_approval":
          return 1;
        case "closed":
          return 2;
        default:
          return 3;
      }
    };

    switch (sortBy) {
      case "updated-desc":
        // If filters are active, just sort by updated date
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        }
        // Default: Status-aware sorting, then by updated date
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

      case "updated-asc":
        // If filters are active, just sort by updated date
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          );
        }
        // Default: Status-aware sorting, then by updated date ascending
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        });

      case "created-desc":
        // If filters are active, just sort by created date
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        // Default: Status-aware sorting, then by created date (newest first)
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      case "created-asc":
        // If filters are active, just sort by created date
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        // Default: Status-aware sorting, then by created date (oldest first)
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

      case "priority-high":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        // If filters are active, just sort by priority
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
          );
        }
        // Default: Status-aware sorting, then by priority
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        });

      case "priority-low":
        const reversePriorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
        // If filters are active, just sort by priority
        if (hasActiveFilters) {
          return issuesCopy.sort((a, b) => 
            (reversePriorityOrder[a.priority] || 99) - (reversePriorityOrder[b.priority] || 99)
          );
        }
        // Default: Status-aware sorting, then by priority
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return (reversePriorityOrder[a.priority] || 99) - (reversePriorityOrder[b.priority] || 99);
        });

      default:
        // Default case: Status-aware sorting, then by created date (newest first)
        return issuesCopy.sort((a, b) => {
          const statusDiff = getStatusOrder(a.status) - getStatusOrder(b.status);
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }
  }

export const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) {
      // Past deadline
      return `${Math.abs(diffDays)}d overdue`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" , year : "numeric"});
    }
  };