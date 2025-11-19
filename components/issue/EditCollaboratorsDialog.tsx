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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Check } from "lucide-react";
import { useUsers } from "@/lib/hooks/useUser";
import { useAddAssignees, useRemoveAssignees, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface EditCollaboratorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
  currentCollaborators: Array<{ id: string; username: string; initials: string }>;
}

export default function EditCollaboratorsDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
  currentCollaborators,
}: EditCollaboratorsDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const addAssigneesMutation = useAddAssignees();
  const removeAssigneesMutation = useRemoveAssignees();
  const addActivityMutation = useAddIssueActivity();

  // Initialize with current collaborators
  useEffect(() => {
    if (open) {
      setSelectedUsers(currentCollaborators.map(c => c.id));
    }
  }, [open, currentCollaborators]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      const currentIds = currentCollaborators.map(c => c.id);
      const usersToAdd = selectedUsers.filter(id => !currentIds.includes(id));
      const usersToRemove = currentIds.filter(id => !selectedUsers.includes(id));

      // Add new collaborators
      if (usersToAdd.length > 0) {
        await addAssigneesMutation.mutateAsync({
          issueId,
          userIds: usersToAdd,
        });

        // Create activity for each added user
        for (const userId of usersToAdd) {
          const user = allUsers.find(u => u.id === userId);
          if (user) {
            await addActivityMutation.mutateAsync({
              issueId,
              activityType: "assignee_add",
              content: {
                added_user_id: userId,
                added_user_name: user.username,
              },
            });
          }
        }
      }

      // Remove collaborators
      if (usersToRemove.length > 0) {
        await removeAssigneesMutation.mutateAsync({
          issueId,
          userIds: usersToRemove,
        });

        // Create activity for each removed user
        for (const userId of usersToRemove) {
          const user = currentCollaborators.find(c => c.id === userId);
          if (user) {
            await addActivityMutation.mutateAsync({
              issueId,
              activityType: "assignee_remove",
              content: {
                removed_user_id: userId,
                removed_user_name: user.username,
              },
            });
          }
        }
      }

      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to update collaborators:", error);
    }
  };

  const handleCancel = () => {
    setSelectedUsers(currentCollaborators.map(c => c.id));
    onOpenChange(false);
  };

  const isPending = addAssigneesMutation.isPending || removeAssigneesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Collaborators</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Manage collaborators for issue #{issueNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {usersLoading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading users...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                Team Members
              </p>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {allUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2" style={{
                          borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"
                        }}>
                          <AvatarFallback 
                            className={cn(
                              "text-xs font-bold",
                              isSelected 
                                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                            )}
                          >
                            {user.initials || user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-base">{user.username}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-[hsl(var(--primary-foreground))]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-2">
                    Selected: {selectedUsers.length} collaborator{selectedUsers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="border-[hsl(var(--border))] font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}