"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import { useCloseIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { logger } from "@/lib/logger";

interface CloseIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
}

export default function CloseIssueDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
}: CloseIssueDialogProps) {
  const [solvedCommit, setSolvedCommit] = useState("");
  const [closingComment, setClosingComment] = useState("");

  const closeIssueMutation = useCloseIssue();
  const addActivityMutation = useAddIssueActivity();

  const handleClose = async () => {
    try {
      // Close the issue
      await closeIssueMutation.mutateAsync({
        issueId,
        solvedCommitNumber: solvedCommit || undefined,
      });

      // If there's a closing comment, add it as a closed activity
      if (closingComment && closingComment !== "<p></p>") {
        await addActivityMutation.mutateAsync({
          issueId,
          activityType: "closed",
          content: {
            text: closingComment,
            solved_commit: solvedCommit || undefined,
          },
        });
      }

      // Reset form
      setSolvedCommit("");
      setClosingComment("");
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to close issue:", error);
    }
  };

  const handleCancel = () => {
    setSolvedCommit("");
    setClosingComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Close Issue</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Mark issue #{issueNumber} as resolved
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Solved Commit Number */}
          <div className="space-y-2">
            <Label htmlFor="solvedCommit" className="font-semibold text-base">
              Solved Commit Number{" "}
              <span className="text-[hsl(var(--muted-foreground))] font-normal text-sm">
                (optional)
              </span>
            </Label>
            <Input
              id="solvedCommit"
              placeholder="e.g., abc123 or full commit hash"
              className="border-[hsl(var(--border))]"
              value={solvedCommit}
              onChange={(e) => setSolvedCommit(e.target.value)}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Reference the commit that fixed this issue
            </p>
          </div>

          {/* Closing Comment */}
          <div className="space-y-2">
            <Label htmlFor="closingComment" className="font-semibold text-base">
              Closing Comment{" "}
              <span className="text-[hsl(var(--muted-foreground))] font-normal text-sm">
                (optional)
              </span>
            </Label>
            <TiptapEditor
              content={closingComment}
              onChange={setClosingComment}
              placeholder="Add any final notes about the resolution..."
              minHeight="min-h-[80px]"
            />
          </div>

          {/* Confirmation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">
              This will mark the issue as closed. You can reopen it later if needed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={closeIssueMutation.isPending}
            className="border-[hsl(var(--border))] font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={closeIssueMutation.isPending}
            className="bg-green-600 text-white hover:bg-green-700 font-semibold"
          >
            {closeIssueMutation.isPending ? (
              "Closing..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Close Issue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}