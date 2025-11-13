"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import { useAddIssueActivity } from "@/lib/hooks/useIssues";
import { toast } from "sonner";

interface CommentInputProps {
  issueId: string;
  issueStatus: string;
  onRequestApproval: () => void;
  onCloseIssue: () => void;
  onReopenFromApproval: () => void;
}

export default function CommentInput({
  issueId,
  issueStatus,
  onRequestApproval,
  onCloseIssue,
  onReopenFromApproval,
}: CommentInputProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Key to force re-render

  const addActivityMutation = useAddIssueActivity();

  const handleComment = async () => {
    if (!comment.trim() || comment === "<p></p>") {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "comment",
        content: { text: comment },
      });
      
      // Clear the editor by resetting state and forcing re-render
      setComment("");
      setResetKey(prev => prev + 1); // This will remount the TiptapEditor
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClosed = issueStatus === "closed";
  const isPendingApproval = issueStatus === "pending_approval";

  // Don't render anything if issue is closed
  if (isClosed) {
    return null;
  }

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 space-y-4">
      {/* Comment Editor */}
      <div>
        <TiptapEditor
          key={resetKey} // Force re-render to clear editor
          content={comment}
          onChange={setComment}
          placeholder="Leave a comment..."
          minHeight="min-h-[60px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        <Button
          onClick={handleComment}
          disabled={isSubmitting || !comment.trim() || comment === "<p></p>"}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment
            </>
          )}
        </Button>

        {/* Show different button based on status */}
        {isPendingApproval ? (
          <Button
            variant="outline"
            onClick={onReopenFromApproval}
            className="border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Back to Open
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onRequestApproval}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <Clock className="h-4 w-4 mr-2" />
            Request Approval
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onCloseIssue}
          className="border-green-200 text-green-600 hover:bg-green-50 font-semibibold"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Close Issue
        </Button>
      </div>
    </div>
  );
}