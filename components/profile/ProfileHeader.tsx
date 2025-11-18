"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import AvatarUpload from "./AvatarUpload";

interface ProfileHeaderProps {
  profile: Profile;
}

const getRoleBadgeColor = (role: string) => {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("admin")) return "bg-red-500/10 text-red-700 border-red-200";
  if (lowerRole.includes("dev")) return "bg-blue-500/10 text-blue-700 border-blue-200";
  if (lowerRole.includes("test")) return "bg-green-500/10 text-green-700 border-green-200";
  if (lowerRole.includes("design")) return "bg-purple-500/10 text-purple-700 border-purple-200";
  return "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]";
};

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-[hsl(var(--primary))]">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-3xl font-bold">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Hover overlay */}
          <button
            onClick={() => setUploadModalOpen(true)}
            className={cn(
              "absolute inset-0 rounded-full bg-black/60 flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            )}
          >
            <Camera className="h-8 w-8 text-white" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            {profile.username}
          </h1>

          {/* Roles */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {profile.roles.map((role) => (
              <Badge
                key={role}
                variant="outline"
                className={cn("font-semibold", getRoleBadgeColor(role))}
              >
                {role}
              </Badge>
            ))}
          </div>

          {/* Join date */}
          <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
            Member since {joinedDate}
          </p>
        </div>
      </div>

      <AvatarUpload
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        userId={profile.id}
        currentAvatarUrl={profile.avatar_url}
        initials={profile.initials}
      />
    </>
  );
}