"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createIssueSchema, type CreateIssueInput } from "@/lib/validations/issue";
import { useCreateIssue } from "@/lib/hooks/useIssues";
import { useUsers } from "@/lib/hooks/useUser";
import { toast } from "sonner";

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateIssueModal({ open, onOpenChange }: CreateIssueModalProps) {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  // Fetch all users for assignee selection
  const { data: users, isLoading: usersLoading } = useUsers();

  // Create issue mutation
  const createIssueMutation = useCreateIssue();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assignedTo: [],
      deadline: undefined,
      category: "default",
      buildVersion: "",
      solvedCommitNumber: "",
    },
  });

  // Watch form values for controlled inputs
  const priority = watch("priority");
  const assignedTo = watch("assignedTo");
  const deadline = watch("deadline");
  const category = watch("category");
  const buildVersion = watch("buildVersion");
  const solvedCommitNumber = watch("solvedCommitNumber");

  // Form submission handler
  const onSubmit = async (data: CreateIssueInput) => {
    try {
      await createIssueMutation.mutateAsync({
        issue: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          deadline: data.deadline ? data.deadline.toISOString() : null,
          build_version: data.buildVersion || null,
          solved_commit_number: data.solvedCommitNumber || null,
          scenario_id: data.scenarioId || null,
          scenario_name: data.scenarioName || null,
        },
        assigneeIds: data.assignedTo,
      });

      // Reset form and close modal on success
      reset();
      setShowAdditionalInfo(false);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook (toast notification)
      console.error("Failed to create issue:", error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    setShowAdditionalInfo(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[700px] h-[min(90vh,calc(100dvh-2rem))] bg-[hsl(var(--card))] border-[hsl(var(--border))] p-0 flex flex-col overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <DialogTitle className="text-2xl font-bold">Create New Issue</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            Fill in the details to create a new issue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-4 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-base">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  className="border-[hsl(var(--border))]"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-base">
                  Description <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-[hsl(var(--border))] rounded-lg p-3 min-h-[150px] bg-[hsl(var(--background))]">
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the issue..."
                    className="border-0 focus-visible:ring-0 resize-none min-h-[120px]"
                    {...register("description")}
                  />
                </div>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Rich text editor (Tiptap) will be integrated later
                </p>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="font-semibold text-base">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <ToggleGroup
                  type="single"
                  value={priority}
                  onValueChange={(value) => value && setValue("priority", value as any)}
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
                {errors.priority && (
                  <p className="text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="font-semibold text-base">
                  Assigned To <span className="text-red-500">*</span>
                </Label>
                {usersLoading ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading users...</p>
                ) : (
                  <ToggleGroup
                    type="multiple"
                    value={assignedTo}
                    onValueChange={(value) => setValue("assignedTo", value)}
                    className="justify-start gap-2 flex-wrap"
                  >
                    {users?.map((user) => (
                      <ToggleGroupItem
                        key={user.id}
                        value={user.id}
                        className="px-3 py-2 font-semibold border-2 data-[state=on]:bg-[hsl(var(--primary))]/10 data-[state=on]:text-[hsl(var(--primary))] data-[state=on]:border-[hsl(var(--primary))]"
                      >
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarFallback className="text-xs bg-[hsl(var(--muted))]">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.username}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
                {errors.assignedTo && (
                  <p className="text-sm text-red-600">{errors.assignedTo.message}</p>
                )}
              </div>

              {/* Additional Info Toggle */}
              <div>
                <button
                  type="button"
                  aria-expanded={showAdditionalInfo}
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  className="flex items-center gap-2 px-1 py-1 rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] font-medium transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 text-[hsl(var(--muted-foreground))]",
                      showAdditionalInfo && "rotate-90 text-[hsl(var(--accent))]"
                    )}
                  />
                  <span className="text-sm">
                    {showAdditionalInfo ? "Hide Additional Information" : "Show Additional Information"}
                  </span>
                </button>

                {showAdditionalInfo && (
                  <div className="mt-4 space-y-5 pl-6 border-l-2 border-[hsl(var(--border))]">
                    {/* Deadline */}
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="font-semibold">
                        Deadline
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-[hsl(var(--border))]",
                              !deadline && "text-[hsl(var(--muted-foreground))]"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {deadline ? deadline.toLocaleDateString() : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[hsl(var(--card))]">
                          <Calendar
                            mode="single"
                            selected={deadline || undefined}
                            onSelect={(date) => setValue("deadline", date || null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Category</Label>
                      <ToggleGroup
                        type="single"
                        value={category}
                        onValueChange={(value) => value && setValue("category", value as any)}
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
                    </div>

                    {/* Build Version */}
                    <div className="space-y-2">
                      <Label htmlFor="buildVersion" className="font-semibold">
                        Build Version
                      </Label>
                      <Input
                        id="buildVersion"
                        placeholder="e.g., v1.2.3"
                        className="border-[hsl(var(--border))]"
                        {...register("buildVersion")}
                      />
                      {errors.buildVersion && (
                        <p className="text-sm text-red-600">{errors.buildVersion.message}</p>
                      )}
                    </div>

                    {/* Solved Commit Number */}
                    <div className="space-y-2">
                      <Label htmlFor="solvedCommitNumber" className="font-semibold">
                        Solved Commit Number
                      </Label>
                      <Input
                        id="solvedCommitNumber"
                        placeholder="e.g., abc123"
                        className="border-[hsl(var(--border))]"
                        {...register("solvedCommitNumber")}
                      />
                      {errors.solvedCommitNumber && (
                        <p className="text-sm text-red-600">{errors.solvedCommitNumber.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-[hsl(var(--border))]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            >
              {isSubmitting ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}