"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useUpdateIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ArchiveIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
}

export default function ArchiveIssueDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
}: ArchiveIssueDialogProps) {
  const router = useRouter();
  const updateIssueMutation = useUpdateIssue();
  const addActivityMutation = useAddIssueActivity();

  const handleConfirm = async () => {
    try {
      // Archive the issue (soft delete)
      await updateIssueMutation.mutateAsync({
        issueId,
        updates: {
          is_archived: true,
        },
      });

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "archived",
        content: {
          message: "archived this issue",
        },
      });

      toast.success("Issue archived successfully");
      onOpenChange(false);
      
      // Redirect back to issues list after a short delay
      setTimeout(() => {
        router.push("/issues");
      }, 500);
    } catch (error) {
      console.error("Failed to archive issue:", error);
      toast.error("Failed to archive issue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Archive className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Archive Issue</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Archive issue #{issueNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-800 font-medium">
              This will archive the issue and hide it from the main issue list.
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>The issue will be marked as archived</li>
              <li>It won't appear in the main issue list</li>
              <li>You can still access it via direct link</li>
              <li>You can unarchive it later if needed</li>
            </ul>
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
            className="bg-red-600 text-white hover:bg-red-700 font-semibold"
          >
            {updateIssueMutation.isPending ? (
              "Archiving..."
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Archive Issue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}