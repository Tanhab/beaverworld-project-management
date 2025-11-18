"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/profile";
import { useUpdateProfileFields } from "@/lib/hooks/useProfile";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateProfileFields();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: profile.username,
      initials: profile.initials,
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      await updateMutation.mutateAsync({
        userId: profile.id,
        updates: data,
      });
      reset(data); // Update form with new values
      setIsEditing(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const createdDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email - Read Only */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Email</Label>
          <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </div>
        <Input
          value={profile.email}
          disabled
          className="bg-[hsl(var(--muted))] cursor-not-allowed"
        />
      </div>

      {/* Username - Editable */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-base font-semibold">
          Username
        </Label>
        <Input
          id="username"
          {...register("username")}
          disabled={!isEditing}
          className={cn(
            !isEditing && "bg-[hsl(var(--background))]",
            errors.username && "border-red-500"
          )}
        />
        {errors.username && (
          <p className="text-sm text-red-500 font-medium">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Initials - Editable */}
      <div className="space-y-2">
        <Label htmlFor="initials" className="text-base font-semibold">
          Initials
        </Label>
        <Input
          id="initials"
          {...register("initials")}
          disabled={!isEditing}
          maxLength={2}
          className={cn(
            "uppercase",
            !isEditing && "bg-[hsl(var(--background))]",
            errors.initials && "border-red-500"
          )}
        />
        {errors.initials && (
          <p className="text-sm text-red-500 font-medium">
            {errors.initials.message}
          </p>
        )}
      </div>

      {/* Discord ID - Read Only */}
      {profile.discord_id && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold">Discord ID</Label>
            <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </div>
          <Input
            value={profile.discord_id}
            disabled
            className="bg-[hsl(var(--muted))] cursor-not-allowed"
          />
        </div>
      )}

      {/* Created At - Read Only */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Member Since</Label>
          <Lock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </div>
        <Input
          value={createdDate}
          disabled
          className="bg-[hsl(var(--muted))] cursor-not-allowed"
        />
      </div>

      {/* Info tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Info className="h-4 w-4" />
              <span>Some fields are read-only</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact an admin to change read-only fields</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </form>
  );
}