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
import { useReopenIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";

interface ReopenIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
}

export default function ReopenIssueDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
}: ReopenIssueDialogProps) {
  const reopenIssueMutation = useReopenIssue();
  const addActivityMutation = useAddIssueActivity();

  const handleConfirm = async () => {
    try {
      // Reopen the issue
      await reopenIssueMutation.mutateAsync(issueId);

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "reopened",
        content: {
          message: "reopened this issue",
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reopen issue:", error);
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
              <DialogTitle className="text-2xl font-bold">Reopen Issue</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Reopen issue #{issueNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium">
              This will change the issue status to <strong>Open</strong>. You can close it again
              later if needed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reopenIssueMutation.isPending}
            className="border-[hsl(var(--border))] font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={reopenIssueMutation.isPending}
            className="bg-orange-600 text-white hover:bg-orange-700 font-semibold"
          >
            {reopenIssueMutation.isPending ? (
              "Reopening..."
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Reopen Issue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}