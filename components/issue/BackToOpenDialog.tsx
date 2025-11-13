"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useUpdateIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";

interface BackToOpenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
}

export default function BackToOpenDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
}: BackToOpenDialogProps) {
  const updateIssueMutation = useUpdateIssue();
  const addActivityMutation = useAddIssueActivity();

  const handleConfirm = async () => {
    try {
      // Update status back to open
      await updateIssueMutation.mutateAsync({
        issueId,
        updates: {
          status: "open",
        },
      });

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "status_change",
        content: {
          old_status: "pending_approval",
          new_status: "open",
          message: "moved back to open status",
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to move back to open:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Back to Open</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Move issue #{issueNumber} back to open status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium">
              This will change the issue status from <strong>Pending Approval</strong> back to{" "}
              <strong>Open</strong>. The issue will no longer be waiting for approval.
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
            className="bg-orange-600 text-white hover:bg-orange-700 font-semibold"
          >
            {updateIssueMutation.isPending ? (
              "Moving..."
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Back to Open
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}