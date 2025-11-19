"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import { useUpdateIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { logger } from "@/lib/logger";

interface EditDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
  currentDescription: string;
}

export default function EditDescriptionDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
  currentDescription,
}: EditDescriptionDialogProps) {
  const [description, setDescription] = useState(currentDescription);

  const updateIssueMutation = useUpdateIssue();
  const addActivityMutation = useAddIssueActivity();

  // Update local state when dialog opens
  useEffect(() => {
    if (open) {
      setDescription(currentDescription);
    }
  }, [open, currentDescription]);

  const handleSave = async () => {
    if (!description.trim() || description === "<p></p>") {
      return;
    }

    try {
      // Update the issue description
      await updateIssueMutation.mutateAsync({
        issueId,
        updates: {
          description,
        },
      });

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "field_update",
        content: {
          field: "description",
          old_value: null, // Don't show old description (too long)
          new_value: "updated the description",
        },
      });

      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to update description:", error);
    }
  };

  const handleCancel = () => {
    setDescription(currentDescription);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[min(90vh,calc(100dvh-2rem))] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Description</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Update the description for issue #{issueNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-4">
            <TiptapEditor
              content={description}
              onChange={setDescription}
              placeholder="Detailed description of the issue..."
              minHeight="min-h-[300px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateIssueMutation.isPending}
            className="border-[hsl(var(--border))] font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateIssueMutation.isPending || !description.trim() || description === "<p></p>"}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold"
          >
            {updateIssueMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}