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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit2, Package, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateIssue, useAddIssueActivity } from "@/lib/hooks/useIssues";
import { logger } from "@/lib/logger";

type FieldType = "priority" | "category" | "deadline" | "build_version" | "solved_commit";

interface EditFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueNumber: number;
  fieldType: FieldType;
  currentValue: any;
}

export default function EditFieldDialog({
  open,
  onOpenChange,
  issueId,
  issueNumber,
  fieldType,
  currentValue,
}: EditFieldDialogProps) {
  const [value, setValue] = useState<any>(currentValue);

  const updateIssueMutation = useUpdateIssue();
  const addActivityMutation = useAddIssueActivity();

  // Update local state when currentValue changes
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const getFieldConfig = () => {
    switch (fieldType) {
      case "priority":
        return {
          title: "Edit Priority",
          description: `Change priority for issue #${issueNumber}`,
          icon: <Edit2 className="h-6 w-6 text-[hsl(var(--primary))]" />,
        };
      case "category":
        return {
          title: "Change Category",
          description: `Update category for issue #${issueNumber}`,
          icon: <Edit2 className="h-6 w-6 text-purple-600" />,
        };
      case "deadline":
        return {
          title: "Set Deadline",
          description: `Set or update deadline for issue #${issueNumber}`,
          icon: <CalendarIcon className="h-6 w-6 text-blue-600" />,
        };
      case "build_version":
        return {
          title: "Edit Build Version",
          description: `Update build version for issue #${issueNumber}`,
          icon: <Package className="h-6 w-6 text-blue-600" />,
        };
      case "solved_commit":
        return {
          title: "Edit Solved Commit",
          description: `Update solved commit number for issue #${issueNumber}`,
          icon: <GitBranch className="h-6 w-6 text-green-600" />,
        };
    }
  };

  const config = getFieldConfig();

  const handleSave = async () => {
    try {
      const oldValue = currentValue;
      
      // Prepare update object
      const updates: any = {};
      if (fieldType === "deadline") {
        updates.deadline = value ? new Date(value).toISOString() : null;
      } else {
        updates[fieldType] = value || null;
      }

      // Update the issue
      await updateIssueMutation.mutateAsync({
        issueId,
        updates,
      });

      // Create activity entry
      await addActivityMutation.mutateAsync({
        issueId,
        activityType: "field_update",
        content: {
          field: fieldType,
          old_value: oldValue ? (fieldType === "deadline" ? new Date(oldValue).toLocaleDateString() : oldValue) : null,
          new_value: value ? (fieldType === "deadline" ? new Date(value).toLocaleDateString() : value) : null,
        },
      });

      onOpenChange(false);
    } catch (error) {
      logger.error(`Failed to update ${fieldType}:`, error);
    }
  };

  const handleCancel = () => {
    setValue(currentValue); // Reset to original value
    onOpenChange(false);
  };

  const renderInput = () => {
    switch (fieldType) {
      case "priority":
        return (
          <ToggleGroup
            type="single"
            value={value}
            onValueChange={setValue}
            className="justify-start gap-2"
          >
            <ToggleGroupItem
              value="low"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-green-50 data-[state=on]:text-green-600 data-[state=on]:border-green-200"
            >
              Low
            </ToggleGroupItem>
            <ToggleGroupItem
              value="medium"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 data-[state=on]:border-blue-200"
            >
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem
              value="high"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-600 data-[state=on]:border-orange-200"
            >
              High
            </ToggleGroupItem>
            <ToggleGroupItem
              value="urgent"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-red-50 data-[state=on]:text-red-600 data-[state=on]:border-red-200"
            >
              Urgent
            </ToggleGroupItem>
          </ToggleGroup>
        );

      case "category":
        return (
          <ToggleGroup
            type="single"
            value={value}
            onValueChange={setValue}
            className="justify-start gap-2"
          >
            <ToggleGroupItem
              value="ui"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-purple-50 data-[state=on]:text-purple-600 data-[state=on]:border-purple-200"
            >
              UI
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dev"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 data-[state=on]:border-blue-200"
            >
              Dev
            </ToggleGroupItem>
            <ToggleGroupItem
              value="media"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-pink-50 data-[state=on]:text-pink-600 data-[state=on]:border-pink-200"
            >
              Media
            </ToggleGroupItem>
            <ToggleGroupItem
              value="default"
              className="px-4 py-2 font-semibold border-2 data-[state=on]:bg-[hsl(var(--muted))] data-[state=on]:text-[hsl(var(--foreground))] data-[state=on]:border-[hsl(var(--border))]"
            >
              Default
            </ToggleGroupItem>
          </ToggleGroup>
        );

      case "deadline":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-[hsl(var(--border))]",
                  !value && "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? new Date(value).toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[hsl(var(--card))]">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => setValue(date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "build_version":
      case "solved_commit":
        return (
          <Input
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            placeholder={fieldType === "build_version" ? "e.g., v1.2.3 or Build 45" : "e.g., abc123 or #55"}
            className="border-[hsl(var(--border))]"
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{config.title}</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="space-y-2">
            <Label className="font-semibold text-base">
              {fieldType === "priority" && "Priority"}
              {fieldType === "category" && "Category"}
              {fieldType === "deadline" && "Deadline"}
              {fieldType === "build_version" && "Build Version"}
              {fieldType === "solved_commit" && "Solved Commit Number"}
            </Label>
            {renderInput()}
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
            disabled={updateIssueMutation.isPending}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold"
          >
            {updateIssueMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}