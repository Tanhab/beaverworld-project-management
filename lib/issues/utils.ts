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

  export function sortIssues(
  issues: IssueWithRelations[],
  sortBy: string
): IssueWithRelations[] {
  const issuesCopy = [...issues];
  
  switch (sortBy) {
    case "updated-desc":
      return issuesCopy.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    case "updated-asc":
      return issuesCopy.sort((a, b) => 
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    case "priority-high":
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return issuesCopy.sort((a, b) => 
        (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
      );
    case "priority-low":
      const reversePriorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
      return issuesCopy.sort((a, b) => 
        (reversePriorityOrder[a.priority] || 99) - (reversePriorityOrder[b.priority] || 99)
      );
    default:
      return issuesCopy;
  }
}