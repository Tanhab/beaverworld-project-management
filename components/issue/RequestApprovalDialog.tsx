"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import { useUpdateIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { logger } from "@/lib/logger";

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
}

export default function RequestApprovalDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
}: RequestApprovalDialogProps) {
  const updateIssueMutation = useUpdateIssue();
  const addActivityMutation = useAddIssueActivity();

  const handleConfirm = async () => {
    try {
      // Update status
      await updateIssueMutation.mutateAsync({
        issueId,
        updates: {
          status: "pending_approval",
        },
      });

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "status_change",
        content: {
          old_status: "open",
          new_status: "pending_approval",
          message: "This will be discussed in the next meeting"
        },
      });

      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to request approval:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Request Approval</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Mark issue #{issueNumber} as pending approval
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">
              This will change the issue status to <strong>Pending Approval</strong>. The issue
              will be discussed in the next meeting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateIssueMutation.isPending}
            className="border-[hsl(var(--border))] font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={updateIssueMutation.isPending}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
          >
            {updateIssueMutation.isPending ? (
              "Updating..."
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Request Approval
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}