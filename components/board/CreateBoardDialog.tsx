"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateBoardInput, BoardCategory } from "@/lib/types/database";

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBoardInput) => Promise<void>;
  initialData?: CreateBoardInput;
  isEditing?: boolean;
}

const categories: BoardCategory[] = ["Dev", "UI", "Media", "Debug", "General"];

export function CreateBoardDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
}: CreateBoardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateBoardInput>({
    defaultValues: initialData || { category: "General" }
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        title: "",
        description: "",
        category: "General",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: CreateBoardInput) => {
    setIsSubmitting(true);
    try {
      // Ensure category defaults to General
      const submitData = {
        ...data,
        category: data.category || "General",
      };
      await onSubmit(submitData);
      if (!isEditing) {
        reset({ title: "", description: "", category: "General" });
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">
            {isEditing ? "Edit Board" : "Create New Board"}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            {isEditing 
              ? "Update your board details."
              : "Create a new task board to organize your work. Default columns will be added automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Board Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Sprint Planning"
              className="border-[hsl(var(--border))]"
              maxLength={30}
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 30,
                  message: "Title must be less than 30 characters",
                },
              })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this board..."
              rows={3}
              className="border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              })}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Category
            </Label>
            <Select
              value={selectedCategory || "General"}
              onValueChange={(value) => setValue("category", value as BoardCategory)}
            >
              <SelectTrigger id="category" className="border-[hsl(var(--border))]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({ title: "", description: "", category: "General" });
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="border-[hsl(var(--border))]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Board" : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}